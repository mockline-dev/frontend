import type { Project } from '@/services/api/projects';

export enum ErrorType {
    NETWORK = 'network',
    VALIDATION = 'validation',
    AUTHENTICATION = 'authentication',
    RATE_LIMIT = 'rate_limit',
    SERVER = 'server',
    TIMEOUT = 'timeout',
    UNKNOWN = 'unknown'
}

export const ERROR_CODES = {
    NETWORK_OFFLINE: 'NETWORK_OFFLINE',
    NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
    NETWORK_ERROR: 'NETWORK_ERROR',
    INVALID_FRAMEWORK: 'INVALID_FRAMEWORK',
    INVALID_LANGUAGE: 'INVALID_LANGUAGE',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
    UNAUTHORIZED: 'UNAUTHORIZED',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    RATE_LIMITED: 'RATE_LIMITED',
    SERVER_ERROR: 'SERVER_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    CREATION_TIMEOUT: 'CREATION_TIMEOUT',
    READY_TIMEOUT: 'READY_TIMEOUT',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface ProjectCreationError {
    type: ErrorType;
    code: ErrorCode;
    message: string;
    details?: string;
    suggestion: string;
    recoverable: boolean;
    timestamp: number;
    originalError?: unknown;
}

export type ProjectCreationState =
    | { status: 'idle' }
    | { status: 'creating'; startTime: number; retryCount: number }
    | { status: 'waiting'; projectId: string; startTime: number }
    | { status: 'timeout'; projectId: string; elapsed: number }
    | { status: 'error'; error: ProjectCreationError; retryCount: number }
    | { status: 'retrying'; error: ProjectCreationError; retryCount: number; nextAttemptIn: number }
    | { status: 'success'; projectId: string }
    | { status: 'cancelled' };

export const TIMEOUT_CONFIG = {
    CREATION_TIMEOUT: 60_000,
    WAITING_TIMEOUT: 120_000,
    RETRY_DELAYS: [2_000, 5_000, 10_000],
    MAX_RETRIES: 3
} as const;

export type ProjectCreationStatus = ProjectCreationState['status'];

export interface ProjectCreationContext {
    attemptId: string;
    userId?: string;
    projectName: string;
    framework: string;
    language: string;
    startTime: number;
    retryCount: number;
    filesGenerated?: number;
    totalFiles?: number;
}

export interface ProjectCreationOptions {
    onStateChange?: (state: ProjectCreationState) => void;
    onError?: (error: ProjectCreationError) => void;
    onSuccess?: (project: Project) => void;
    timeoutConfig?: Partial<typeof TIMEOUT_CONFIG>;
    enableAutoRetry?: boolean;
}

export interface ProjectCreationProgress {
    progress: number;
    filesGenerated: number;
    totalFiles: number;
    phase: 'initializing' | 'generating' | 'finalizing';
}

export interface RetryOptions {
    maxRetries?: number;
    delays?: number[];
    shouldRetry?: (error: ProjectCreationError) => boolean;
    onRetry?: (attempt: number, error: ProjectCreationError) => void;
    onMaxRetriesReached?: (error: ProjectCreationError) => void;
}

export interface RetryStatus {
    isRetrying: boolean;
    attempt: number;
    nextRetryIn?: number;
}
