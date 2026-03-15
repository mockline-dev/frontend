/**
 * Validation Schemas
 * Centralized validation schemas using zod for consistent input validation
 */

import { z } from 'zod';

/**
 * UUID Validation Schema
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Project ID Validation Schema
 */
export const projectIdSchema = uuidSchema;

/**
 * Project Name Validation Schema
 */
export const projectNameSchema = z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .trim();

/**
 * Project Description Validation Schema
 */
export const projectDescriptionSchema = z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .trim();

/**
 * Framework Validation Schema
 */
export const frameworkSchema = z.enum([
    'fast-api',
    'feathers',
    'express',
    'go-gin',
    'spring-boot',
    'actix',
    'nestjs'
], {
    errorMap: () => ({ message: 'Invalid framework selected' })
});

/**
 * Language Validation Schema
 */
export const languageSchema = z.enum([
    'python',
    'typescript',
    'go',
    'java',
    'rust'
], {
    errorMap: () => ({ message: 'Invalid language selected' })
});

/**
 * Create Project Data Validation Schema
 */
export const createProjectDataSchema = z.object({
    name: projectNameSchema,
    description: projectDescriptionSchema,
    framework: frameworkSchema,
    language: languageSchema,
    model: z.string().optional()
});

/**
 * Update Project Data Validation Schema
 */
export const updateProjectDataSchema = z.object({
    name: projectNameSchema.optional(),
    description: projectDescriptionSchema.optional(),
    status: z.enum([
        'initializing',
        'generating',
        'validating',
        'ready',
        'error'
    ]).optional(),
    errorMessage: z.string().optional()
}).strict();

/**
 * Run Backend Params Validation Schema
 */
export const runBackendParamsSchema = z.object({
    projectId: projectIdSchema,
    onLog: z.function().optional()
});

/**
 * Generate AI Response Params Validation Schema
 */
export const generateAIResponseParamsSchema = z.object({
    projectId: projectIdSchema,
    prompt: z
        .string()
        .min(1, 'Prompt is required')
        .max(10000, 'Prompt must be less than 10000 characters')
        .trim()
});

/**
 * Fetch AI Response Params Validation Schema
 */
export const fetchAIResponseParamsSchema = z.object({
    query: z.record(z.unknown()).optional()
});

/**
 * File Name Validation Schema
 */
export const fileNameSchema = z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'File name contains invalid characters')
    .trim();

/**
 * File Key Validation Schema
 */
export const fileKeySchema = z
    .string()
    .min(1, 'File key is required')
    .max(500, 'File key must be less than 500 characters')
    .trim();

/**
 * Create File Data Validation Schema
 */
export const createFileDataSchema = z.object({
    projectId: projectIdSchema,
    messageId: uuidSchema.optional(),
    name: fileNameSchema,
    key: fileKeySchema,
    fileType: z.string().min(1, 'File type is required'),
    size: z.number().int().nonnegative('File size must be non-negative'),
    currentVersion: z.number().int().positive('Current version must be positive').optional()
});

/**
 * Update File Data Validation Schema
 */
export const updateFileDataSchema = z.object({
    size: z.number().int().nonnegative('File size must be non-negative').optional(),
    currentVersion: z.number().int().positive('Current version must be positive').optional()
}).strict();

/**
 * Create Message Data Validation Schema
 */
export const createMessageDataSchema = z.object({
    projectId: projectIdSchema,
    role: z.enum(['user', 'system', 'assistant']),
    type: z.enum(['text', 'file']).optional(),
    content: z.string().min(1, 'Content is required'),
    tokens: z.number().int().nonnegative().optional(),
    status: z.string().optional()
});

/**
 * Update Message Data Validation Schema
 */
export const updateMessageDataSchema = z.object({
    content: z.string().min(1, 'Content is required').optional(),
    tokens: z.number().int().nonnegative().optional(),
    status: z.string().optional()
}).strict();

/**
 * Create Snapshot Data Validation Schema
 */
export const createSnapshotDataSchema = z.object({
    projectId: projectIdSchema,
    label: z.string().min(1, 'Label is required').max(100, 'Label must be less than 100 characters'),
    trigger: z.enum(['auto-generation', 'auto-ai-edit', 'manual']),
    version: z.number().int().positive('Version must be positive'),
    r2Prefix: z.string().optional(),
    files: z.array(z.object({
        fileId: uuidSchema,
        name: fileNameSchema,
        key: fileKeySchema,
        r2SnapshotKey: z.string(),
        size: z.number().int().nonnegative(),
        fileType: z.string()
    })).optional(),
    totalSize: z.number().int().nonnegative().optional(),
    fileCount: z.number().int().nonnegative().optional()
});

/**
 * Stream AI Request Validation Schema
 */
export const streamAIRequestSchema = z.object({
    projectId: projectIdSchema,
    message: z
        .string()
        .min(1, 'Message is required')
        .max(10000, 'Message must be less than 10000 characters')
        .trim(),
    model: z.string().optional(),
    conversationHistory: z.array(z.object({
        role: z.enum(['user', 'system', 'assistant']),
        content: z.string()
    })).optional(),
    context: z.object({
        files: z.array(z.string()).optional(),
        fileTree: z.array(z.object({
            path: z.string(),
            size: z.number().int().nonnegative().optional(),
            fileType: z.string().optional()
        })).optional(),
        selectedFile: z.string().optional(),
        selectedContent: z.string().optional(),
        selectedRange: z.object({
            startLine: z.number().int().nonnegative(),
            endLine: z.number().int().nonnegative()
        }).optional(),
        pinnedFiles: z.array(z.string()).optional(),
        allowedEditFiles: z.array(z.string()).optional()
    }).optional()
});

/**
 * Query Params Validation Schema
 */
export const queryParamsSchema = z.object({
    $sort: z.record(z.union([z.literal(1), z.literal(-1)])).optional(),
    $limit: z.number().int().positive().max(100).optional(),
    $skip: z.number().int().nonnegative().optional()
}).passthrough();

/**
 * Project Query Validation Schema
 */
export const projectQuerySchema = queryParamsSchema.extend({
    userId: uuidSchema.optional(),
    status: z.enum([
        'initializing',
        'generating',
        'validating',
        'ready',
        'error'
    ]).optional()
});

/**
 * File Query Validation Schema
 */
export const fileQuerySchema = queryParamsSchema.extend({
    projectId: projectIdSchema.optional(),
    messageId: uuidSchema.optional()
});

/**
 * Message Query Validation Schema
 */
export const messageQuerySchema = queryParamsSchema.extend({
    projectId: projectIdSchema.optional(),
    role: z.enum(['user', 'system', 'assistant']).optional()
});

/**
 * Snapshot Query Validation Schema
 */
export const snapshotQuerySchema = queryParamsSchema.extend({
    projectId: projectIdSchema.optional(),
    version: z.number().int().positive().optional()
});

/**
 * Type exports for convenience
 */
export type CreateProjectData = z.infer<typeof createProjectDataSchema>;
export type UpdateProjectData = z.infer<typeof updateProjectDataSchema>;
export type RunBackendParams = z.infer<typeof runBackendParamsSchema>;
export type GenerateAIResponseParams = z.infer<typeof generateAIResponseParamsSchema>;
export type FetchAIResponseParams = z.infer<typeof fetchAIResponseParamsSchema>;
export type CreateFileData = z.infer<typeof createFileDataSchema>;
export type UpdateFileData = z.infer<typeof updateFileDataSchema>;
export type CreateMessageData = z.infer<typeof createMessageDataSchema>;
export type UpdateMessageData = z.infer<typeof updateMessageDataSchema>;
export type CreateSnapshotData = z.infer<typeof createSnapshotDataSchema>;
export type StreamAIRequest = z.infer<typeof streamAIRequestSchema>;
export type QueryParams = z.infer<typeof queryParamsSchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
export type FileQuery = z.infer<typeof fileQuerySchema>;
export type MessageQuery = z.infer<typeof messageQuerySchema>;
export type SnapshotQuery = z.infer<typeof snapshotQuerySchema>;
