import { runBackend } from '@/api/projects/runBackend';
import { NextRequest } from 'next/server';
import { runBackendParamsSchema } from '@/types/validation';
import { getErrorMessage } from '@/types/errors';

export const maxDuration = 600; // 10 minutes for pip install + server start

export async function POST(request: NextRequest) {
    try {
        const requestBody = await request.json();
        const { projectId } = runBackendParamsSchema.parse(requestBody);

        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                const send = (data: object) => {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                    );
                };

                try {
                    const result = await runBackend({
                        projectId,
                        onLog: (log) => {
                            send({ event: 'log', ...log });
                        }
                    });

                    send({ event: 'done', result });
                } catch (err: unknown) {
                    const message = getErrorMessage(err);
                    send({ event: 'error', message });
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                Connection: 'keep-alive',
                'X-Accel-Buffering': 'no'
            }
        });
    } catch (err: unknown) {
        if (err instanceof Error && err.name === 'ZodError') {
            return new Response(
                JSON.stringify({
                    error: 'Invalid request parameters',
                    details: err.message
                }),
                { status: 400 }
            );
        }

        const errorMessage = getErrorMessage(err);
        return new Response(
            JSON.stringify({ error: errorMessage || 'Internal server error' }),
            { status: 500 }
        );
    }
}
