import { ERROR_CODES, type ErrorCode } from '@/types/projectCreation';

export interface ErrorMessage {
    title: string;
    message: string;
    suggestion: string;
    recoverable: boolean;
}

export const ERROR_MESSAGES: Record<ErrorCode, ErrorMessage> = {
    [ERROR_CODES.NETWORK_OFFLINE]: {
        title: "You're offline",
        message: 'Please check your internet connection.',
        suggestion: 'Check your network settings and try again.',
        recoverable: true
    },

    [ERROR_CODES.NETWORK_TIMEOUT]: {
        title: 'Network request timed out',
        message: 'The request took too long to complete.',
        suggestion: 'Your connection may be slow. Try again.',
        recoverable: true
    },

    [ERROR_CODES.NETWORK_ERROR]: {
        title: 'Network error occurred',
        message: 'A network error prevented the request from completing.',
        suggestion: 'Check your internet connection and try again.',
        recoverable: true
    },

    [ERROR_CODES.INVALID_FRAMEWORK]: {
        title: 'Invalid framework selected',
        message: 'The selected framework is not supported.',
        suggestion: 'Please choose a valid framework (fast-api, feathers).',
        recoverable: false
    },

    [ERROR_CODES.INVALID_LANGUAGE]: {
        title: 'Invalid language selected',
        message: 'The selected language is not supported.',
        suggestion: 'Please choose a valid language (python, typescript).',
        recoverable: false
    },

    [ERROR_CODES.MISSING_REQUIRED_FIELD]: {
        title: 'Missing required field',
        message: 'One or more required fields are missing.',
        suggestion: 'Please fill in all required fields and try again.',
        recoverable: false
    },

    [ERROR_CODES.UNAUTHORIZED]: {
        title: 'Unauthorized',
        message: "You're not authorized to create projects.",
        suggestion: 'Please log in and try again.',
        recoverable: false
    },

    [ERROR_CODES.SESSION_EXPIRED]: {
        title: 'Session expired',
        message: 'Your session has expired. Please log in again.',
        suggestion: 'Please log in and try again.',
        recoverable: false
    },

    [ERROR_CODES.RATE_LIMITED]: {
        title: 'Too many requests',
        message: "You've made too many requests. Please wait before trying again.",
        suggestion: 'Wait a few minutes before trying again.',
        recoverable: true
    },

    [ERROR_CODES.SERVER_ERROR]: {
        title: 'Server error occurred',
        message: 'An internal server error occurred while creating your project.',
        suggestion: 'Our team has been notified. Please try again later.',
        recoverable: true
    },

    [ERROR_CODES.SERVICE_UNAVAILABLE]: {
        title: 'Service unavailable',
        message: 'The service is temporarily unavailable.',
        suggestion: 'Our team has been notified. Please try again later.',
        recoverable: true
    },

    [ERROR_CODES.CREATION_TIMEOUT]: {
        title: 'Project creation timeout',
        message: 'Project creation is taking longer than expected.',
        suggestion: 'You can wait longer or try creating again.',
        recoverable: true
    },

    [ERROR_CODES.READY_TIMEOUT]: {
        title: 'Project initialization timeout',
        message: 'Project initialization is taking longer than expected.',
        suggestion: 'The project may still complete. Check your dashboard.',
        recoverable: true
    },

    [ERROR_CODES.UNKNOWN_ERROR]: {
        title: 'An unexpected error occurred',
        message: 'Something went wrong while creating your project.',
        suggestion: 'Please try again. If the problem persists, contact support.',
        recoverable: true
    }
};
