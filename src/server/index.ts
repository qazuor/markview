import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

// Dynamic import after env is loaded
const start = async () => {
    const { serve } = await import('@hono/node-server');
    const { app } = await import('./api/app');

    const port = Number(process.env.API_PORT) || 3017;

    console.log(`🚀 API server running on http://localhost:${port}`);

    serve({
        fetch: app.fetch,
        port
    });
};

start();
