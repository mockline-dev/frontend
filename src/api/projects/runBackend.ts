import type { File } from '@/services/api/files';
import { createFeathersServerClient } from '@/services/feathersServer';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { createServer } from 'net';
import { dirname, join } from 'path';
import { fetchFileContent } from '../files/fetchFileContent';

const PIP_INSTALL_TIMEOUT_MS = 6 * 60 * 1000;

export interface RunBackendParams {
    projectId: string;
    onLog?: (log: BackendLogEntry) => void;
}

export interface BackendRunResult {
    success: boolean;
    message: string;
    failureType?: 'syntax_error' | 'port_conflict' | 'import_error' | 'timeout' | 'startup_error';
    logs?: BackendLogEntry[];
    project?: {
        name: string;
        description: string;
    };
    files?: {
        total: number;
        mainFile: string;
        hasRequirements: boolean;
        filesList: string[];
    };
    server?: {
        pid: number;
        port: number;
        url: string;
        docsUrl: string;
        redocUrl: string;
        openapiUrl: string;
    };
    validation?: {
        filesValid: boolean;
        mainFileValid: boolean;
        requirementsValid: boolean;
        errors: string[];
    };
    details?: string;
}

export interface BackendLogEntry {
    type: 'info' | 'error' | 'success' | 'warning' | 'system';
    message: string;
    source?: string;
}

export type RunBackendResponse = { success: true; data: BackendRunResult } | { success: false; error: string; data?: BackendRunResult };

const HEALTH_CHECK_RETRIES = 5;
const HEALTH_CHECK_RETRY_DELAY_MS = 2000;
const HEALTH_CHECK_TIMEOUT_MS = 3000;

const toProjectRelativePath = (file: { key: string; name: string }): string => {
    const key = file.key || '';
    const projectsPrefix = 'projects/';

    if (key.startsWith(projectsPrefix)) {
        const firstSlashAfterProjectId = key.indexOf('/', projectsPrefix.length);
        if (firstSlashAfterProjectId !== -1 && firstSlashAfterProjectId + 1 < key.length) {
            return key.slice(firstSlashAfterProjectId + 1);
        }
    }

    return file.name;
};

export const runBackend = async ({ projectId, onLog }: RunBackendParams): Promise<RunBackendResponse> => {
    const tempDir = join(process.cwd(), '.temp-backend');
    const logs: BackendLogEntry[] = [];

    const pushLog = (type: BackendLogEntry['type'], message: string, source = 'runner') => {
        const entry: BackendLogEntry = { type, message, source };
        logs.push(entry);
        onLog?.(entry);
        if (type === 'error') {
            console.error(message);
        } else if (type === 'warning') {
            console.warn(message);
        } else {
            console.log(message);
        }
    };

    const runStreamingCommand = async (command: string, args: string[], cwd: string, source: string, timeoutMs = PIP_INSTALL_TIMEOUT_MS): Promise<void> => {
        await new Promise<void>((resolve, reject) => {
            const child = spawn(command, args, {
                cwd,
                shell: false,
                env: process.env
            });

            let stdoutBuffer = '';
            let stderrBuffer = '';

            const flushBuffer = (buffer: string, type: BackendLogEntry['type']) => {
                const lines = buffer.split('\n');
                const remainder = lines.pop() || '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed) {
                        pushLog(type, trimmed, source);
                    }
                }

                return remainder;
            };

            const timeout = setTimeout(() => {
                child.kill('SIGTERM');
                reject(new Error(`Command timed out after ${Math.floor(timeoutMs / 1000)}s: ${command} ${args.join(' ')}`));
            }, timeoutMs);

            child.stdout?.on('data', (chunk: Buffer | string) => {
                stdoutBuffer += chunk.toString();
                stdoutBuffer = flushBuffer(stdoutBuffer, 'info');
            });

            child.stderr?.on('data', (chunk: Buffer | string) => {
                stderrBuffer += chunk.toString();
                stderrBuffer = flushBuffer(stderrBuffer, 'warning');
            });

            child.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });

            child.on('close', (code) => {
                clearTimeout(timeout);

                const remainingOut = stdoutBuffer.trim();
                if (remainingOut) {
                    pushLog('info', remainingOut, source);
                }

                const remainingErr = stderrBuffer.trim();
                if (remainingErr) {
                    pushLog('warning', remainingErr, source);
                }

                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Command exited with code ${code}: ${command} ${args.join(' ')}`));
                }
            });
        });
    };

    try {
        const server = await createFeathersServerClient();

        // Get project details
        const project = await server.service('projects').get(projectId);

        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        pushLog('system', `Preparing backend run for project: ${project.name}`, 'backend-runner');

        // Get project files
        const filesResult = await server.service('files').find({
            query: { projectId, $sort: { name: 1 }, $limit: 200 }
        });

        const files = filesResult.data || [];

        if (files.length === 0) {
            return { success: false, error: 'No files found for this project' };
        }

        pushLog('info', `Found ${files.length} files in project`, 'backend-runner');

        // Find main.py or server.py file
        const mainFile = files.find((f: File) => {
            const relativePath = toProjectRelativePath(f);
            return relativePath === 'main.py' || relativePath === 'server.py' || relativePath.endsWith('/main.py') || relativePath.endsWith('/server.py');
        });

        if (!mainFile) {
            return { success: false, error: 'No main.py or server.py file found' };
        }

        pushLog('info', `Detected entrypoint: ${toProjectRelativePath(mainFile)}`, 'backend-runner');

        // Check if requirements.txt exists
        const requirementsFile = files.find((f: File) => {
            const relativePath = toProjectRelativePath(f);
            return relativePath === 'requirements.txt' || relativePath.endsWith('/requirements.txt');
        });

        // Validate LLM-generated files
        const validation = await validateGeneratedFiles(files, mainFile, requirementsFile);

        if (!validation.filesValid) {
            pushLog('error', 'Generated files validation failed', 'validator');
            for (const validationError of validation.errors) {
                pushLog('error', validationError, 'validator');
            }
            return {
                success: false,
                error: 'Generated files validation failed',
                data: {
                    success: false,
                    message: 'Validation failed',
                    logs,
                    project: {
                        name: project.name,
                        description: project.description
                    },
                    validation
                }
            };
        }

        // Create temporary directory for backend
        await mkdir(tempDir, { recursive: true });
        pushLog('info', `Created temporary workspace: ${tempDir}`, 'backend-runner');

        // Download and write all files to temp directory
        const filesList: string[] = [];
        for (const file of files) {
            try {
                // Use the new fetchFileContent function
                const result = await fetchFileContent({ fileId: file._id });

                if (!result.success) {
                    throw new Error(result.error);
                }

                const content = result.content;

                // Write file to temp directory
                const relativePath = toProjectRelativePath(file);
                const filePath = join(tempDir, relativePath);
                await mkdir(dirname(filePath), { recursive: true });
                await writeFile(filePath, content, 'utf-8');
                filesList.push(relativePath);

                pushLog('info', `Downloaded and wrote file: ${relativePath}`, 'downloader');
            } catch (error) {
                pushLog('error', `Failed to download file ${file.name}: ${error instanceof Error ? error.message : String(error)}`, 'downloader');
                validation.errors.push(`Failed to download ${file.name}: ${error}`);
            }
        }

        // Install Python dependencies
        pushLog('system', 'Installing Python dependencies...', 'pip');
        try {
            if (existsSync(join(tempDir, 'requirements.txt'))) {
                // Clean up requirements.txt - remove invalid entries and version constraints
                const requirementsPath = join(tempDir, 'requirements.txt');
                let requirementsContent = await readFile(requirementsPath, 'utf-8');
                const nonPythonPackages = new Set(['express', 'bcryptjs', 'next', 'react', 'react-dom', 'vite', 'typescript', 'nodemon', 'npm', 'pnpm', 'yarn']);

                // Remove version constraints and invalid entries
                requirementsContent = requirementsContent
                    .split('\n')
                    .map((line: string) => {
                        const trimmedLine = line.trim();
                        // Skip empty lines and comments
                        if (!trimmedLine || trimmedLine.startsWith('#')) {
                            return line;
                        }
                        // Remove python version specifications entirely
                        if (trimmedLine.toLowerCase().startsWith('python==')) {
                            return null;
                        }
                        // Remove version constraints (==, >=, <=, ~=, >, <, !=) from packages
                        const packageName = trimmedLine.split(/[=<>!~]+/)[0]?.trim() || trimmedLine;

                        // Drop common Node.js-only dependencies accidentally generated into requirements.txt
                        if (nonPythonPackages.has(packageName.toLowerCase())) {
                            pushLog('warning', `Removed non-Python dependency from requirements.txt: ${packageName}`, 'pip');
                            return null;
                        }

                        return packageName;
                    })
                    .filter((line: string | null): line is string => line !== null && line.length > 0)
                    .join('\n');

                // Write cleaned requirements back
                await writeFile(requirementsPath, requirementsContent, 'utf-8');
                pushLog('info', 'Cleaned requirements.txt - removed version constraints', 'pip');

                pushLog('info', 'Installing dependencies from requirements.txt...', 'pip');
                await runStreamingCommand('pip', ['install', '-r', 'requirements.txt', '--disable-pip-version-check'], tempDir, 'pip');
                pushLog('success', 'Dependencies installed successfully', 'pip');
            } else {
                pushLog('info', 'Installing default Python dependencies...', 'pip');
                await runStreamingCommand('pip', ['install', 'fastapi', 'uvicorn[standard]', 'python-multipart', '--disable-pip-version-check'], tempDir, 'pip');
                pushLog('success', 'Basic dependencies installed', 'pip');
            }
        } catch (error: unknown) {
            const execError = error as { message?: string };
            pushLog('error', `Failed to install dependencies: ${execError.message || 'Unknown error'}`, 'pip');
            await cleanupTempDir(tempDir);
            return {
                success: false,
                error: 'Failed to install Python dependencies',
                data: {
                    success: false,
                    message: 'Failed to install dependencies',
                    details: execError.message || 'Unknown error',
                    logs,
                    validation
                }
            };
        }

        const mainRelativePath = toProjectRelativePath(mainFile);

        pushLog('system', 'Validating Python syntax...', 'python');
        try {
            try {
                await runStreamingCommand('python', ['-m', 'py_compile', mainRelativePath], tempDir, 'python');
            } catch {
                await runStreamingCommand('python3', ['-m', 'py_compile', mainRelativePath], tempDir, 'python');
            }
            pushLog('success', 'Python syntax validation passed', 'python');
        } catch (error: unknown) {
            const syntaxError = error as { message?: string };
            pushLog('error', `Python syntax validation failed: ${syntaxError.message || 'Unknown error'}`, 'python');
            await cleanupTempDir(tempDir);
            return {
                success: false,
                error: 'Python syntax validation failed',
                data: {
                    success: false,
                    message: 'Syntax validation failed',
                    failureType: 'syntax_error',
                    details: syntaxError.message || 'Unknown error',
                    logs,
                    validation,
                    files: {
                        total: files.length,
                        mainFile: mainFile.name,
                        hasRequirements: !!requirementsFile,
                        filesList
                    }
                }
            };
        }

        // Run the FastAPI server
        const port = await getAvailablePort();
        const moduleName = mainRelativePath.replace(/\.py$/i, '').replace(/\//g, '.');
        pushLog('system', `Starting FastAPI server on port ${port}...`, 'uvicorn');

        const serverProcess = spawn('uvicorn', [`${moduleName}:app`, '--host', '0.0.0.0', '--port', String(port)], {
            cwd: tempDir,
            shell: false,
            env: process.env
        });

        let exitedBeforeReady = false;
        let startupExitCode: number | null = null;
        const uvicornErrors: string[] = [];

        serverProcess.stdout?.on('data', (chunk: Buffer | string) => {
            const lines = chunk
                .toString()
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean);

            for (const line of lines) {
                pushLog('info', line, 'uvicorn');
            }
        });

        serverProcess.stderr?.on('data', (chunk: Buffer | string) => {
            const lines = chunk
                .toString()
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean);

            for (const line of lines) {
                uvicornErrors.push(line);
                pushLog('warning', line, 'uvicorn');
            }
        });

        serverProcess.on('error', (error) => {
            uvicornErrors.push(error.message);
            pushLog('error', `Failed to spawn uvicorn: ${error.message}`, 'uvicorn');
        });

        serverProcess.on('close', (code) => {
            startupExitCode = code;
            exitedBeforeReady = true;
            pushLog('warning', `Uvicorn process exited with code ${code ?? 'unknown'}`, 'uvicorn');
        });

        const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        let serverRunning = false;
        for (let attempt = 1; attempt <= HEALTH_CHECK_RETRIES; attempt++) {
            if (exitedBeforeReady) {
                break;
            }

            try {
                const healthCheck = await fetch(`http://localhost:${port}/docs`, {
                    signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS)
                });
                if (healthCheck.ok) {
                    serverRunning = true;
                    pushLog('success', `Server health check passed on attempt ${attempt}/${HEALTH_CHECK_RETRIES}`, 'uvicorn');
                    break;
                }
                pushLog('warning', `Health check returned status ${healthCheck.status} on attempt ${attempt}/${HEALTH_CHECK_RETRIES}`, 'uvicorn');
            } catch (error) {
                pushLog(
                    'warning',
                    `Server health check attempt ${attempt}/${HEALTH_CHECK_RETRIES} failed: ${error instanceof Error ? error.message : String(error)}`,
                    'uvicorn'
                );
            }

            if (attempt < HEALTH_CHECK_RETRIES) {
                await wait(HEALTH_CHECK_RETRY_DELAY_MS);
            }
        }

        if (!serverRunning) {
            if (!serverProcess.killed) {
                serverProcess.kill('SIGTERM');
            }
            await cleanupTempDir(tempDir);

            const combinedError = uvicornErrors.join(' | ').toLowerCase();
            const failureType: BackendRunResult['failureType'] =
                combinedError.includes('address already in use') || combinedError.includes('port')
                    ? 'port_conflict'
                    : combinedError.includes('importerror') || combinedError.includes('modulenotfounderror')
                      ? 'import_error'
                      : exitedBeforeReady && startupExitCode !== 0
                        ? 'startup_error'
                        : 'timeout';

            return {
                success: false,
                error: 'Failed to start FastAPI server',
                data: {
                    success: false,
                    message: 'Failed to start server',
                    failureType,
                    details: uvicornErrors.length > 0 ? uvicornErrors.join('\n') : 'Server health check failed before readiness',
                    logs,
                    validation,
                    files: {
                        total: files.length,
                        mainFile: mainFile.name,
                        hasRequirements: !!requirementsFile,
                        filesList
                    }
                }
            };
        }

        const result: BackendRunResult = {
            success: true,
            message: 'Backend server started successfully',
            project: {
                name: project.name,
                description: project.description
            },
            logs,
            files: {
                total: files.length,
                mainFile: mainFile.name,
                hasRequirements: !!requirementsFile,
                filesList
            },
            server: {
                pid: serverProcess.pid || 0,
                port,
                url: `http://localhost:${port}`,
                docsUrl: `http://localhost:${port}/docs`,
                redocUrl: `http://localhost:${port}/redoc`,
                openapiUrl: `http://localhost:${port}/openapi.json`
            },
            validation
        };

        pushLog('success', 'Backend server started successfully', 'uvicorn');
        return { success: true, data: result };
    } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        pushLog('error', `Failed to run backend: ${error.response?.data?.message || error.message || 'Unknown error'}`, 'backend-runner');
        await cleanupTempDir(tempDir);
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to run backend',
            data: {
                success: false,
                message: 'Failed to run backend',
                logs
            }
        };
    }
};

async function validateGeneratedFiles(
    files: File[],
    mainFile: File,
    requirementsFile: File | undefined
): Promise<{
    filesValid: boolean;
    mainFileValid: boolean;
    requirementsValid: boolean;
    errors: string[];
}> {
    const errors: string[] = [];
    let mainFileValid = false;
    let requirementsValid = false;

    // Check if main file exists
    if (mainFile) {
        mainFileValid = true;
    } else {
        errors.push('No main.py or server.py file found');
    }

    // Check if requirements.txt exists (optional but recommended)
    if (requirementsFile) {
        requirementsValid = true;
    } else {
        errors.push('No requirements.txt file found (will install basic dependencies)');
    }

    // Check for essential FastAPI files
    const essentialFiles = ['main.py', 'server.py'];
    const hasEssentialFile = files.some((f) => {
        const relativePath = toProjectRelativePath(f);
        return essentialFiles.includes(relativePath) || essentialFiles.some((fileName) => relativePath.endsWith(`/${fileName}`));
    });

    if (!hasEssentialFile) {
        errors.push('Missing essential FastAPI files');
    }

    // Check file sizes (LLM might generate empty or very small files)
    for (const file of files) {
        const relativePath = toProjectRelativePath(file);
        if (file.size === 0) {
            errors.push(`File ${file.name} is empty`);
        } else if (file.size < 50 && relativePath.endsWith('.py')) {
            errors.push(`File ${relativePath} is too small (${file.size} bytes), might be incomplete`);
        }
    }

    const filesValid = mainFileValid && errors.filter((e) => !e.includes('requirements.txt')).length === 0;

    return {
        filesValid,
        mainFileValid,
        requirementsValid,
        errors
    };
}

async function cleanupTempDir(tempDir: string) {
    try {
        if (existsSync(tempDir)) {
            await rm(tempDir, { recursive: true, force: true });
            console.log('Cleaned up temporary directory');
        }
    } catch (error) {
        console.error('Failed to cleanup temp directory:', error);
    }
}

async function getAvailablePort(): Promise<number> {
    return await new Promise((resolve, reject) => {
        const server = createServer();

        server.unref();

        server.on('error', (error) => {
            server.close();
            reject(error);
        });

        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (!address || typeof address === 'string') {
                server.close(() => reject(new Error('Failed to resolve available port')));
                return;
            }

            const { port } = address;
            server.close((closeError) => {
                if (closeError) {
                    reject(closeError);
                    return;
                }
                resolve(port);
            });
        });
    });
}
