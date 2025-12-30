import { handle } from 'hono/vercel';
import app from '../src/server/api/app';

// Export Hono app as Vercel serverless function
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

// Also export config for Vercel
export const config = {
    runtime: 'edge'
};
