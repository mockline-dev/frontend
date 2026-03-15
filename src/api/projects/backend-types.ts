/**
 * Backend Types
 * Type definitions for backend generation and execution
 */

import type { ProjectFile } from '@/types/feathers';

/**
 * Parameters for running backend
 */
export interface RunBackendParams {
    projectId: string;
    onLog?: (log: BackendLogEntry) => void;
}

/**
 * Result of backend run operation
 */
export interface BackendRunResult {
    success: boolean;
    message: string;
    failureType?: BackendRunErrorType;
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
    validation?: BackendValidationResult;
    details?: string;
}

/**
 * Backend log entry
 */
export interface BackendLogEntry {
    type: 'info' | 'error' | 'success' | 'warning' | 'system';
    message: string;
    source?: string;
}

/**
 * Backend run error types
 */
export type BackendRunErrorType =
    | 'syntax_error'
    | 'port_conflict'
    | 'import_error'
    | 'timeout'
    | 'startup_error'
    | 'validation_error'
    | 'dependency_error';

/**
 * Backend run response
 */
export type RunBackendResponse =
    | { success: true; data: BackendRunResult }
    | { success: false; error: string; data?: BackendRunResult };

/**
 * Backend validation result
 */
export interface BackendValidationResult {
    filesValid: boolean;
    mainFileValid: boolean;
    requirementsValid: boolean;
    errors: string[];
}

/**
 * File with project-relative path
 */
export interface FileWithRelativePath extends ProjectFile {
    relativePath: string;
}

/**
 * Process execution options
 */
export interface ProcessExecutionOptions {
    cwd: string;
    timeout?: number;
    env?: Record<string, string>;
}

/**
 * Process execution result
 */
export interface ProcessExecutionResult {
    code: number | null;
    signal: string | null;
    stdout: string;
    stderr: string;
}

/**
 * Server process info
 */
export interface ServerProcessInfo {
    pid: number;
    port: number;
    url: string;
    docsUrl: string;
    redocUrl: string;
    openapiUrl: string;
}

/**
 * Health check options
 */
export interface HealthCheckOptions {
    retries: number;
    retryDelay: number;
    timeout: number;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
    success: boolean;
    attempt: number;
    status?: number;
    error?: string;
}
