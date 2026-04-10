'use server';

import { createFeathersServerClient } from '@/services/feathersServer';

export interface FetchFileContentParams {
    fileId: string;
}

export type FetchFileContentResponse = { success: true; content: string } | { success: false; error: string };

export const fetchFileContent = async ({ fileId }: FetchFileContentParams): Promise<FetchFileContentResponse> => {
    try {
        const server = await createFeathersServerClient();
        const file = await server.service('files').get(fileId);

        if (!file) {
            return { success: false, error: 'File not found' };
        }
        const streamResult = await server.service('file-stream').get(file.key);

        if (!streamResult || !streamResult.url) {
            return { success: false, error: 'Failed to get file URL' };
        }
        const response = await fetch(streamResult.url);

        if (!response.ok) {
            return { success: false, error: `Failed to fetch file content: ${response.status}` };
        }

        const content = await response.text();
        return { success: true, content };
    } catch (err: unknown) {
        console.error('Failed to fetch file content:', err);
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch file content'
        };
    }
};
