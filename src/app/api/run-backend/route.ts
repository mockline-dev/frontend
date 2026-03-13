import { runBackend } from '@/api/projects/runBackend';
import { NextRequest } from 'next/server';

export const maxDuration = 600; // 10 minutes for pip install + server start

export async function POST(request: NextRequest) {
    const { projectId } = await request.json();

    if (!projectId) {
        return new Response(JSON.stringify({ error: 'projectId is required' }), { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (data: object) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
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
                const message = err instanceof Error ? err.message : 'Unknown error';
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
}
