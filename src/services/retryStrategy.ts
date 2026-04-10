import { ProjectCreationError, TIMEOUT_CONFIG, type RetryOptions, type RetryStatus } from '@/types/projectCreation';
import { errorHandler } from './errorHandler';

export class RetryStrategy {
    private retryTimeouts: Map<ReturnType<typeof setTimeout>, ReturnType<typeof setTimeout>> = new Map();
    private currentAttempt = 0;
    private isRetrying = false;
    private nextRetryTime: number | null = null;
    private timeoutIdCounter = 0;

    async executeWithRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
        const { maxRetries = TIMEOUT_CONFIG.MAX_RETRIES, delays = TIMEOUT_CONFIG.RETRY_DELAYS, shouldRetry = () => true, onRetry, onMaxRetriesReached } = options;

        this.currentAttempt = 0;
        this.isRetrying = true;

        while (this.currentAttempt <= maxRetries) {
            try {
                const result = await fn();
                this.cleanup();
                return result;
            } catch (error) {
                const classifiedError = errorHandler.classifyError(error);

                if (this.currentAttempt >= maxRetries || !shouldRetry(classifiedError)) {
                    this.cleanup();

                    if (this.currentAttempt >= maxRetries && onMaxRetriesReached) {
                        onMaxRetriesReached(classifiedError);
                    }

                    throw classifiedError;
                }

                const delayIndex = Math.min(this.currentAttempt, delays.length - 1);
                const delay = delays[delayIndex]!;

                if (onRetry) {
                    onRetry(this.currentAttempt + 1, classifiedError);
                }

                await this.waitForDelay(delay);

                this.currentAttempt++;
            }
        }

        this.cleanup();
        throw new Error('Max retries exceeded');
    }

    private async waitForDelay(delay: number): Promise<void> {
        this.nextRetryTime = Date.now() + delay;

        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                this.retryTimeouts.delete(timeoutId);
                this.nextRetryTime = null;
                resolve();
            }, delay);

            this.retryTimeouts.set(timeoutId as ReturnType<typeof setTimeout>, timeoutId);
        });
    }

    cancel(): void {
        this.cleanup();
    }

    getRetryStatus(): RetryStatus {
        const status: RetryStatus = {
            isRetrying: this.isRetrying,
            attempt: this.currentAttempt
        };

        if (this.nextRetryTime) {
            status.nextRetryIn = Math.max(0, this.nextRetryTime - Date.now());
        }

        return status;
    }

    private cleanup(): void {
        this.isRetrying = false;
        this.nextRetryTime = null;
        this.retryTimeouts.forEach((timeoutId) => {
            clearTimeout(timeoutId);
        });
        this.retryTimeouts.clear();
    }

    isRecoverable(error: ProjectCreationError): boolean {
        return errorHandler.isRecoverable(error);
    }

    getRetryDelay(error: ProjectCreationError, attempt: number): number {
        return errorHandler.getRetryDelay(error, attempt);
    }

    reset(): void {
        this.cancel();
        this.currentAttempt = 0;
    }
}

export const retryStrategy = new RetryStrategy();
