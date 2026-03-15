/**
 * Error Type Definitions
 * Centralized error types for consistent error handling across the application
 */

/**
 * FeathersJS Error Response Structure
 */
export interface FeathersErrorResponse {
    name: string;
    message: string;
    code: number;
    className: string;
    data?: Record<string, unknown>;
    errors?: Record<string, unknown>;
}

/**
 * Standardized API Error
 */
export interface ApiError {
    message: string;
    code?: number;
    details?: string;
    response?: {
        data?: {
            message?: string;
            errors?: Record<string, unknown>;
        };
    };
}

/**
 * Backend Run Error Types
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
 * Backend Run Error
 */
export interface BackendRunError extends Error {
    type: BackendRunErrorType;
    details?: string;
    logs?: string[];
}

/**
 * Validation Error
 */
export interface ValidationError extends Error {
    field?: string;
    value?: unknown;
    constraints?: Record<string, string>;
}

/**
 * File Operation Error
 */
export interface FileOperationError extends Error {
    filePath?: string;
    operation: 'read' | 'write' | 'delete' | 'create';
    originalError?: Error;
}

/**
 * Process Execution Error
 */
export interface ProcessExecutionError extends Error {
    command: string;
    args: string[];
    exitCode?: number;
    signal?: string;
}

/**
 * Type Guard for FeathersJS Error
 */
export function isFeathersError(error: unknown): error is FeathersErrorResponse {
    return (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        'message' in error &&
        'code' in error
    );
}

/**
 * Type Guard for ApiError
 */
export function isApiError(error: unknown): error is ApiError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as ApiError).message === 'string'
    );
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
        return error;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (isFeathersError(error)) {
        return error.message;
    }

    if (isApiError(error)) {
        return error.message;
    }

    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as { message: unknown }).message);
    }

    return 'Unknown error occurred';
}

/**
 * Create a BackendRunError
 */
export function createBackendRunError(
    type: BackendRunErrorType,
    message: string,
    details?: string
): BackendRunError {
    const error = new Error(message) as BackendRunError;
    error.type = type;
    error.details = details;
    error.name = 'BackendRunError';
    return error;
}

/**
 * Create a ValidationError
 */
export function createValidationError(
    message: string,
    field?: string,
    value?: unknown
): ValidationError {
    const error = new Error(message) as ValidationError;
    error.field = field;
    error.value = value;
    error.name = 'ValidationError';
    return error;
}

/**
 * Create a FileOperationError
 */
export function createFileOperationError(
    message: string,
    operation: FileOperationError['operation'],
    filePath?: string,
    originalError?: Error
): FileOperationError {
    const error = new Error(message) as FileOperationError;
    error.operation = operation;
    error.filePath = filePath;
    error.originalError = originalError;
    error.name = 'FileOperationError';
    return error;
}

/**
 * Create a ProcessExecutionError
 */
export function createProcessExecutionError(
    message: string,
    command: string,
    args: string[],
    exitCode?: number,
    signal?: string
): ProcessExecutionError {
    const error = new Error(message) as ProcessExecutionError;
    error.command = command;
    error.args = args;
    error.exitCode = exitCode;
    error.signal = signal;
    error.name = 'ProcessExecutionError';
    return error;
}
