'use server';

import { createFeathersServerClient } from '@/services/feathersServer';
import type { Architecture } from '@/types/feathers';
import { apiServices } from '../services';

export const fetchArchitecture = async (projectId: string): Promise<Architecture | null> => {
    try {
        const server = await createFeathersServerClient();
        const result = (await server.service(apiServices.architecture).find({
            query: { projectId, $limit: 1 }
        })) as any;
        const data = Array.isArray(result) ? result : (result.data ?? []);
        return data.length > 0 ? (JSON.parse(JSON.stringify(data[0])) as Architecture) : null;
    } catch (err: unknown) {
        const error = err as { message?: string };
        throw new Error(error.message || 'Failed to fetch architecture');
    }
};
