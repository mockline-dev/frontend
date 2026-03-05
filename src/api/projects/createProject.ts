'use server';

import { createFeathersServerClient } from '@/services/feathersServer';
import { apiServices } from '../services';

export interface CreateProjectParams {
    name: string;
    description?: string;
    userId?: string;
    [key: string]: unknown;
}

export type CreateProjectResponse = { success: true; data: Record<string, unknown> } | { success: false; error: string; validationErrors?: Record<string, unknown> };

export const createProject = async (params: CreateProjectParams): Promise<CreateProjectResponse> => {
    try {
        const server = await createFeathersServerClient();
        const result = await server.service(apiServices.projects).create(params);
        return { success: true, data: JSON.parse(JSON.stringify(result)) };
    } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string; errors?: Record<string, unknown> } }; message?: string; data?: { errors?: Record<string, unknown> } };
        
        // Log detailed error information for debugging
        console.error('Failed to create project:', {
            message: error.message,
            responseData: error.response?.data,
            validationErrors: error.response?.data?.errors || error.data?.errors,
            fullError: err
        });
        
        const validationErrors = error.response?.data?.errors || error.data?.errors;
        const errorResponse: CreateProjectResponse = {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to create project'
        };
        
        if (validationErrors) {
            errorResponse.validationErrors = validationErrors;
        }
        
        return errorResponse;
    }
};
