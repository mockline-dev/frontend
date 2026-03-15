/**
 * Backend Utilities
 * Utility functions for backend generation and execution
 */

import { existsSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { createServer } from 'net';
import { dirname, join } from 'path';
import { spawn, type ChildProcess } from 'child_process';
import type { BackendLogEntry, ProcessExecutionOptions } from './backend-types';
import { TEMP_BACKEND_DIR, PIP_INSTALL_TIMEOUT_MS, HEALTH_CHECK_TIMEOUT_MS } from './backend-constants';
import { getErrorMessage } from '@/types/errors';

/**
 * Create a temporary directory for backend
 */
export async function createTempDir(): Promise<string> {
    const tempDir = join(process.cwd(), TEMP_BACKEND_DIR);
    await mkdir(tempDir, { recursive: true });
    return tempDir;
}

/**
 * Clean up temporary directory
 */
export async function cleanupTempDir(tempDir: string): Promise<void> {
    try {
        if (existsSync(tempDir)) {
            await rm(tempDir, { recursive: true, force: true });
        }
    } catch (error) {
        throw new Error(`Failed to cleanup temp directory: ${getErrorMessage(error)}`);
    }
}

/**
 * Get an available port
 */
export async function getAvailablePort(): Promise<number> {
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

/**
 * Run a streaming command with logging
 */
export async function runStreamingCommand(
    command: string,
    args: string[],
    options: ProcessExecutionOptions,
    source: string,
    onLog?: (log: BackendLogEntry) => void,
    timeout: number = PIP_INSTALL_TIMEOUT_MS
): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: options.cwd,
            shell: false,
            env: options.env || process.env
        });

        let stdoutBuffer = '';
        let stderrBuffer = '';

        const flushBuffer = (buffer: string, type: BackendLogEntry['type']) => {
            const lines = buffer.split('\n');
            const remainder = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && onLog) {
                    onLog({ type, message: trimmed, source });
                }
            }

            return remainder;
        };

        const timeoutId = setTimeout(() => {
            child.kill('SIGTERM');
            reject(
                new Error(
                    `Command timed out after ${Math.floor(timeout / 1000)}s: ${command} ${args.join(' ')}`
                )
            );
        }, timeout);

        child.stdout?.on('data', (chunk: Buffer | string) => {
            stdoutBuffer += chunk.toString();
            stdoutBuffer = flushBuffer(stdoutBuffer, 'info');
        });

        child.stderr?.on('data', (chunk: Buffer | string) => {
            stderrBuffer += chunk.toString();
            stderrBuffer = flushBuffer(stderrBuffer, 'warning');
        });

        child.on('error', (error) => {
            clearTimeout(timeoutId);
            reject(error);
        });

        child.on('close', (code) => {
            clearTimeout(timeoutId);

            const remainingOut = stdoutBuffer.trim();
            if (remainingOut && onLog) {
                onLog({ type: 'info', message: remainingOut, source });
            }

            const remainingErr = stderrBuffer.trim();
            if (remainingErr && onLog) {
                onLog({ type: 'warning', message: remainingErr, source });
            }

            if (code === 0) {
                resolve();
            } else {
                reject(
                    new Error(`Command exited with code ${code}: ${command} ${args.join(' ')}`)
                );
            }
        });
    });
}

/**
 * Perform health check on server
 */
export async function performHealthCheck(
    port: number,
    attempt: number
): Promise<{ success: boolean; status?: number; error?: string }> {
    try {
        const healthCheck = await fetch(`http://localhost:${port}/docs`, {
            signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS)
        });

        if (healthCheck.ok) {
            return { success: true, status: healthCheck.status };
        }

        return {
            success: false,
            status: healthCheck.status,
            error: `Health check returned status ${healthCheck.status}`
        };
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error)
        };
    }
}

/**
 * Wait for a specified duration
 */
export function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clean requirements.txt content
 */
export async function cleanRequirementsContent(
    requirementsPath: string
): Promise<string> {
    const { NON_PYTHON_PACKAGES } = await import('./backend-constants');
    let requirementsContent = await readFile(requirementsPath, 'utf-8');

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
            if (NON_PYTHON_PACKAGES.has(packageName.toLowerCase())) {
                return null;
            }

            return packageName;
        })
        .filter((line: string | null): line is string => line !== null && line.length > 0)
        .join('\n');

    // Ensure email-validator is included (required for Pydantic EmailStr)
    if (!requirementsContent.toLowerCase().includes('email-validator')) {
        requirementsContent = requirementsContent.trim() + '\nemail-validator';
    }

    return requirementsContent;
}

/**
 * Fix missing SQLAlchemy imports in model files
 */
export async function fixModelFileImports(
    tempDir: string,
    filesList: string[]
): Promise<void> {
    const modelFiles = filesList.filter(
        (file) => file.startsWith('app/models/') && file.endsWith('.py')
    );

    if (modelFiles.length === 0) {
        return;
    }

    for (const modelFile of modelFiles) {
        const filePath = join(tempDir, modelFile);
        try {
            let content = await readFile(filePath, 'utf-8');

            // Check if the file uses Base class
            const hasBaseClass = /\bclass\s+\w+\s*\(\s*Base\s*\)/.test(content);

            if (!hasBaseClass) {
                continue; // Skip if file doesn't use Base class
            }

            // Check if Base is imported or defined
            const hasBaseImport =
                /from\s+sqlalchemy\.orm\s+import.*declarative_base|Base\s*=\s*declarative_base\(\)/.test(
                    content
                );

            if (hasBaseImport) {
                continue; // Skip if Base is already imported
            }

            // Check what imports are already present
            const hasSqlalchemyImports = /from\s+sqlalchemy\s+import/.test(content);
            const hasDateTimeImport = /from\s+datetime\s+import/.test(content);

            // Build the necessary imports
            const importsToAdd: string[] = [];

            if (!hasSqlalchemyImports) {
                importsToAdd.push(
                    'from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey'
                );
            } else {
                // Add missing Column types if sqlalchemy is imported
                const existingImports = content.match(/from\s+sqlalchemy\s+import\s+([^\n]+)/);
                if (existingImports) {
                    const importedTypes = existingImports[1].split(',').map((s) => s.trim());
                    const requiredTypes = [
                        'Column',
                        'Integer',
                        'String',
                        'Boolean',
                        'DateTime',
                        'ForeignKey'
                    ];
                    const missingTypes = requiredTypes.filter(
                        (type) => !importedTypes.includes(type)
                    );
                    if (missingTypes.length > 0) {
                        importsToAdd.push(`from sqlalchemy import ${missingTypes.join(', ')}`);
                    }
                }
            }

            // Add declarative_base import
            importsToAdd.push('from sqlalchemy.orm import declarative_base');

            // Add datetime import if not present
            if (!hasDateTimeImport) {
                importsToAdd.push('from datetime import datetime');
            }

            // Add Base definition
            importsToAdd.push('');
            importsToAdd.push('Base = declarative_base()');

            if (importsToAdd.length === 0) {
                continue;
            }

            // Find the position to insert imports (after existing imports or at the beginning)
            const lines = content.split('\n');
            let insertIndex = 0;

            // Find the last import statement
            for (let i = 0; i < lines.length; i++) {
                const trimmedLine = lines[i].trim();
                if (trimmedLine.startsWith('from ') || trimmedLine.startsWith('import ')) {
                    insertIndex = i + 1;
                } else if (trimmedLine && !trimmedLine.startsWith('#') && insertIndex > 0) {
                    break;
                }
            }

            // Insert the new imports
            lines.splice(insertIndex, 0, ...importsToAdd);

            // Write the fixed content back
            await writeFile(filePath, lines.join('\n'), 'utf-8');
        } catch (error) {
            throw new Error(`Failed to fix imports in ${modelFile}: ${getErrorMessage(error)}`);
        }
    }
}

/**
 * Get safe environment variables for child process
 */
export function getSafeEnvironmentVariables(): Record<string, string> {
    const safeEnv: Record<string, string> = {};

    // Only include safe environment variables
    const allowedPrefixes = ['PATH', 'HOME', 'USER', 'LANG', 'LC_'];

    for (const [key, value] of Object.entries(process.env)) {
        if (allowedPrefixes.some((prefix) => key.startsWith(prefix))) {
            safeEnv[key] = value;
        }
    }

    return safeEnv;
}
