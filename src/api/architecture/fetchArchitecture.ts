'use server';

import { createFeathersServerClient } from '@/services/feathersServer';
import type { Architecture, FeathersResponse } from '@/types/feathers';
import { apiServices } from '../services';
import { projectIdSchema } from '@/types/validation';
import { getErrorMessage } from '@/types/errors';

export const fetchArchitecture = async (
    projectId: string
): Promise<Architecture | null> => {
    try {
        const validatedProjectId = projectIdSchema.parse(projectId);
        const server = await createFeathersServerClient();
        const result = (await server
            .service(apiServices.architecture)
            .find({
                query: { projectId: validatedProjectId, $limit: 1 }
            })) as FeathersResponse<Architecture>;

        const data = Array.isArray(result) ? result : result.data ?? [];
        return data.length > 0 ? (data[0] as Architecture) : null;
    } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ZodError') {
            throw new Error('Invalid project ID format');
        }

        const errorMessage = getErrorMessage(err);
        throw new Error(errorMessage || 'Failed to fetch architecture');
    }
};
