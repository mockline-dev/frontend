'use server';

import { createFeathersServerClient } from '@/services/feathersServer';
import { Stack, StacksResponse } from '@/types/stacks';
import { apiServices } from '../services';

/**
 * Fetches all available stacks from the backend API.
 *
 * This function retrieves the list of technology stacks that can be used
 * for project generation. Each stack includes information about the
 * programming language, framework, and key features.
 *
 * @returns Promise resolving to an array of Stack objects
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * try {
 *   const stacks = await fetchStacks();
 *   console.log(`Found ${stacks.length} stacks`);
 * } catch (error) {
 *   console.error('Failed to fetch stacks:', error);
 * }
 * ```
 */
export const fetchStacks = async (): Promise<Stack[]> => {
    try {
        const server = await createFeathersServerClient();

        // Call the stacks service (backend endpoint: GET /stacks)
        const result = await server.service(apiServices.stacks).find();

        // Handle different response formats
        // FeathersJS can return either { data: [...], total: ... } or direct array
        const stacks = Array.isArray(result) ? result : (result as StacksResponse).stacks || (result as { data: Stack[] }).data;

        return JSON.parse(JSON.stringify(stacks)) as Stack[];
    } catch (err: unknown) {
        const error = err as {
            response?: { data?: { message?: string; errors?: Record<string, unknown> } };
            message?: string;
            data?: { errors?: Record<string, unknown> };
        };

        console.error('Failed to fetch stacks:', {
            message: error.message,
            responseData: error.response?.data,
            validationErrors: error.response?.data?.errors || error.data?.errors,
            fullError: err
        });

        // Throw a more user-friendly error
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch available stacks. Please try again.';

        throw new Error(errorMessage);
    }
};

/**
 * Fetches a specific stack by its ID.
 *
 * @param stackId - The unique identifier of the stack to fetch
 * @returns Promise resolving to the Stack object
 * @throws Error if the stack is not found or the request fails
 *
 * @example
 * ```typescript
 * try {
 *   const stack = await fetchStackById('python-fastapi');
 *   console.log(`Found stack: ${stack.name}`);
 * } catch (error) {
 *   console.error('Failed to fetch stack:', error);
 * }
 * ```
 */
export const fetchStackById = async (stackId: string): Promise<Stack> => {
    try {
        const server = await createFeathersServerClient();

        const result = await server.service(apiServices.stacks).get(stackId);

        return JSON.parse(JSON.stringify(result)) as Stack;
    } catch (err: unknown) {
        const error = err as {
            response?: { data?: { message?: string; errors?: Record<string, unknown> } };
            message?: string;
            data?: { errors?: Record<string, unknown> };
        };

        console.error(`Failed to fetch stack ${stackId}:`, {
            message: error.message,
            responseData: error.response?.data,
            validationErrors: error.response?.data?.errors || error.data?.errors,
            fullError: err
        });

        const errorMessage = error.response?.data?.message || error.message || `Failed to fetch stack: ${stackId}. Please try again.`;

        throw new Error(errorMessage);
    }
};
