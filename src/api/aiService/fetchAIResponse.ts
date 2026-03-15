'use server';

import { createFeathersServerClient } from '@/services/feathersServer';
import { apiServices } from '../services';
import { fetchAIResponseParamsSchema } from '@/types/validation';
import { getErrorMessage, type ApiError } from '@/types/errors';

export interface FetchAIResponseParams {
    query?: Record<string, unknown>;
}

export interface FetchAIResponseData {
    _id: string;
    projectId: string;
    prompt: string;
    response: string;
    tokens?: number;
    createdAt: number;
    updatedAt: number;
}

export type FetchAIResponseResponse =
    | { success: true; data: FetchAIResponseData[] }
    | { success: false; error: string };

export const fetchAIResponse = async (
    params?: FetchAIResponseParams
): Promise<FetchAIResponseResponse> => {
    try {
        const validatedParams = fetchAIResponseParamsSchema.parse(params || {});
        const server = await createFeathersServerClient();
        const result = await server
            .service(apiServices.aiService)
            .find(validatedParams.query || {});

        return {
            success: true,
            data: result as FetchAIResponseData[]
        };
    } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);

        if (err instanceof Error && err.name === 'ZodError') {
            return {
                success: false,
                error: 'Invalid query parameters'
            };
        }

        const apiError = err as ApiError;
        const detailedError =
            apiError.response?.data?.message ||
            apiError.message ||
            errorMessage;

        return {
            success: false,
            error: detailedError
        };
    }
};
