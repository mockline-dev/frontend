import { ERROR_CODES, ErrorType, ProjectCreationError, type ErrorCode } from '@/types/projectCreation';
import { ERROR_MESSAGES } from '@/utils/errorMessages';

export class ErrorHandler {
    classifyError(error: unknown): ProjectCreationError {
        if (this.isNetworkError(error)) {
            return this.createNetworkError(error);
        }

        if (this.isFeathersError(error)) {
            return this.createFeathersError(error);
        }

        if (this.isValidationError(error)) {
            return this.createValidationError(error);
        }

        return this.createUnknownError(error);
    }

    private isNetworkError(error: unknown): boolean {
        if (error instanceof TypeError) {
            const message = error.message.toLowerCase();
            if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch') || message.includes('network request failed')) {
                return true;
            }
        }

        if (error instanceof Error && error.name === 'NetworkError') {
            return true;
        }

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return true;
        }

        if (typeof error === 'object' && error !== null) {
            const err = error as Record<string, unknown>;
            const code = String(err.code || err.name || '');
            if (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ECONNRESET' || code === 'EAI_AGAIN') {
                return true;
            }

            const statusCode = Number(err.statusCode || err.status || err.code);
            if (statusCode >= 500 && statusCode < 600) {
                return true;
            }
        }

        return false;
    }

    private isFeathersError(error: unknown): boolean {
        return typeof error === 'object' && error !== null && 'name' in error && 'code' in error && 'message' in error;
    }

    private isValidationError(error: unknown): boolean {
        return typeof error === 'object' && error !== null && 'name' in error && (error as Record<string, unknown>).name === 'BadRequest';
    }

    private createNetworkError(error: unknown): ProjectCreationError {
        const err = error as Error;
        const isOffline = !navigator.onLine;
        const isTimeout = err.message.toLowerCase().includes('timeout');

        const errorCode: ErrorCode = isOffline ? ERROR_CODES.NETWORK_OFFLINE : isTimeout ? ERROR_CODES.NETWORK_TIMEOUT : ERROR_CODES.NETWORK_ERROR;

        const errorMessage = ERROR_MESSAGES[errorCode];

        return {
            type: ErrorType.NETWORK,
            code: errorCode,
            message: errorMessage.message,
            details: err.message,
            suggestion: errorMessage.suggestion,
            recoverable: errorMessage.recoverable,
            timestamp: Date.now(),
            originalError: error
        };
    }

    private createFeathersError(error: unknown): ProjectCreationError {
        const feathersError = error as Record<string, unknown>;
        const code = (feathersError.code || feathersError.name) as string;

        const errorMapping: Record<string, ErrorCode> = {
            '401': ERROR_CODES.UNAUTHORIZED,
            '429': ERROR_CODES.RATE_LIMITED,
            '500': ERROR_CODES.SERVER_ERROR,
            '503': ERROR_CODES.SERVICE_UNAVAILABLE
        };

        const errorCode = errorMapping[code] || ERROR_CODES.SERVER_ERROR;
        const errorMessage = ERROR_MESSAGES[errorCode];

        return {
            type: this.getErrorTypeFromCode(errorCode),
            code: errorCode,
            message: errorMessage.message,
            details: String(feathersError.message || ''),
            suggestion: errorMessage.suggestion,
            recoverable: errorMessage.recoverable,
            timestamp: Date.now(),
            originalError: error
        };
    }

    private createValidationError(error: unknown): ProjectCreationError {
        const validationError = error as Record<string, unknown>;
        const errors = (validationError.errors || (validationError.data as Record<string, unknown> | undefined)?.errors || {}) as Record<string, unknown>;

        let errorCode: ErrorCode = ERROR_CODES.MISSING_REQUIRED_FIELD;
        if (errors.framework) {
            errorCode = ERROR_CODES.INVALID_FRAMEWORK;
        } else if (errors.language) {
            errorCode = ERROR_CODES.INVALID_LANGUAGE;
        }

        const errorMessage = ERROR_MESSAGES[errorCode];

        return {
            type: ErrorType.VALIDATION,
            code: errorCode,
            message: errorMessage.message,
            details: JSON.stringify(errors),
            suggestion: errorMessage.suggestion,
            recoverable: errorMessage.recoverable,
            timestamp: Date.now(),
            originalError: error
        };
    }

    private createUnknownError(error: unknown): ProjectCreationError {
        const errorMessage = ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];

        return {
            type: ErrorType.UNKNOWN,
            code: ERROR_CODES.UNKNOWN_ERROR,
            message: errorMessage.message,
            details: error instanceof Error ? error.message : String(error),
            suggestion: errorMessage.suggestion,
            recoverable: errorMessage.recoverable,
            timestamp: Date.now(),
            originalError: error
        };
    }

    private getErrorTypeFromCode(code: string): ErrorType {
        if (code.startsWith('NETWORK')) return ErrorType.NETWORK;
        if (code === ERROR_CODES.UNAUTHORIZED || code === ERROR_CODES.SESSION_EXPIRED) {
            return ErrorType.AUTHENTICATION;
        }
        if (code === ERROR_CODES.RATE_LIMITED) return ErrorType.RATE_LIMIT;
        if (code.startsWith('SERVER') || code === ERROR_CODES.SERVICE_UNAVAILABLE) {
            return ErrorType.SERVER;
        }
        if (code.includes('TIMEOUT')) return ErrorType.TIMEOUT;
        if (code.startsWith('INVALID') || code === ERROR_CODES.MISSING_REQUIRED_FIELD) {
            return ErrorType.VALIDATION;
        }
        return ErrorType.UNKNOWN;
    }

    getErrorMessage(error: ProjectCreationError): string {
        return error.message;
    }

    getRecoverySuggestion(error: ProjectCreationError): string {
        return error.suggestion;
    }

    isRecoverable(error: ProjectCreationError): boolean {
        return error.recoverable;
    }

    getRetryDelay(error: ProjectCreationError, attempt: number): number {
        const baseDelays: Record<ErrorType, number[]> = {
            [ErrorType.NETWORK]: [2_000, 5_000, 10_000],
            [ErrorType.RATE_LIMIT]: [5_000, 10_000, 30_000],
            [ErrorType.SERVER]: [2_000, 5_000, 10_000],
            [ErrorType.TIMEOUT]: [5_000, 10_000, 15_000],
            [ErrorType.UNKNOWN]: [2_000, 5_000, 10_000],
            [ErrorType.VALIDATION]: [],
            [ErrorType.AUTHENTICATION]: []
        };

        const delays = baseDelays[error.type] || baseDelays[ErrorType.UNKNOWN];

        if (delays.length === 0) {
            return 0;
        }

        const delayIndex = Math.min(attempt, delays.length - 1);
        const delay = delays[delayIndex]!;

        return delay;
    }
}

export const errorHandler = new ErrorHandler();
