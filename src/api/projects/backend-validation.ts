/**
 * Backend Validation
 * Validation logic for backend generation
 */

import type { ProjectFile } from '@/types/feathers';
import type { BackendValidationResult, FileWithRelativePath } from './backend-types';
import { ESSENTIAL_FASTAPI_FILES, MIN_PYTHON_FILE_SIZE, PROJECTS_PREFIX } from './backend-constants';

/**
 * Convert file key to project-relative path
 */
export function toProjectRelativePath(file: { key: string; name: string }): string {
    const key = file.key || '';

    if (key.startsWith(PROJECTS_PREFIX)) {
        const firstSlashAfterProjectId = key.indexOf('/', PROJECTS_PREFIX.length);
        if (firstSlashAfterProjectId !== -1 && firstSlashAfterProjectId + 1 < key.length) {
            return key.slice(firstSlashAfterProjectId + 1);
        }
    }

    return file.name;
}

/**
 * Validate generated files
 */
export async function validateGeneratedFiles(
    files: ProjectFile[],
    mainFile: ProjectFile | undefined,
    requirementsFile: ProjectFile | undefined
): Promise<BackendValidationResult> {
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
    const hasEssentialFile = files.some((file) => {
        const relativePath = toProjectRelativePath(file);
        return (
            ESSENTIAL_FASTAPI_FILES.includes(relativePath) ||
            ESSENTIAL_FASTAPI_FILES.some((fileName) =>
                relativePath.endsWith(`/${fileName}`)
            )
        );
    });

    if (!hasEssentialFile) {
        errors.push('Missing essential FastAPI files');
    }

    // Check file sizes (LLM might generate empty or very small files)
    for (const file of files) {
        const relativePath = toProjectRelativePath(file);
        if (file.size === 0) {
            errors.push(`File ${file.name} is empty`);
        } else if (file.size < MIN_PYTHON_FILE_SIZE && relativePath.endsWith('.py')) {
            errors.push(
                `File ${relativePath} is too small (${file.size} bytes), might be incomplete`
            );
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

/**
 * Find main file in files list
 */
export function findMainFile(files: ProjectFile[]): ProjectFile | undefined {
    return files.find((file) => {
        const relativePath = toProjectRelativePath(file);
        return (
            relativePath === 'main.py' ||
            relativePath === 'server.py' ||
            relativePath.endsWith('/main.py') ||
            relativePath.endsWith('/server.py')
        );
    });
}

/**
 * Find requirements file in files list
 */
export function findRequirementsFile(files: ProjectFile[]): ProjectFile | undefined {
    return files.find((file) => {
        const relativePath = toProjectRelativePath(file);
        return (
            relativePath === 'requirements.txt' ||
            relativePath.endsWith('/requirements.txt')
        );
    });
}

/**
 * Convert files to files with relative paths
 */
export function convertFilesToRelativePaths(files: ProjectFile[]): FileWithRelativePath[] {
    return files.map((file) => ({
        ...file,
        relativePath: toProjectRelativePath(file)
    }));
}

/**
 * Validate Python syntax
 */
export async function validatePythonSyntax(
    filePath: string,
    workingDir: string
): Promise<void> {
    const { spawn } = await import('child_process');

    await new Promise<void>((resolve, reject) => {
        const child = spawn('python', ['-m', 'py_compile', filePath], {
            cwd: workingDir,
            shell: false
        });

        let stderr = '';

        child.stderr?.on('data', (chunk: Buffer | string) => {
            stderr += chunk.toString();
        });

        child.on('error', (error) => {
            reject(error);
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Python syntax validation failed: ${stderr}`));
            }
        });
    });
}
