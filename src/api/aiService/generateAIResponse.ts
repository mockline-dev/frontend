'use server';

import { createFeathersServerClient } from '@/services/feathersServer';
import { apiServices } from '../services';
import { generateAIResponseParamsSchema } from '@/types/validation';
import { getErrorMessage, type ApiError } from '@/types/errors';

export interface GenerateAIResponseParams {
    projectId: string;
    prompt: string;
}

export interface GenerateAIResponseData {
    _id: string;
    projectId: string;
    prompt: string;
    response: string;
    tokens?: number;
    createdAt: number;
    updatedAt: number;
}

export type GenerateAIResponseResponse =
    | { success: true; data: GenerateAIResponseData }
    | { success: false; error: string };

export const generateAIResponse = async (
    params: GenerateAIResponseParams
): Promise<GenerateAIResponseResponse> => {
    try {
        const validatedParams = generateAIResponseParamsSchema.parse(params);
        const server = await createFeathersServerClient();
        const result = await server
            .service(apiServices.aiService)
            .create(validatedParams);

        return {
            success: true,
            data: result as GenerateAIResponseData
        };
    } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);

        if (err instanceof Error && err.name === 'ZodError') {
            return {
                success: false,
                error: 'Invalid input parameters'
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
