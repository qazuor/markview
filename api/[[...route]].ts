import { handle } from 'hono/vercel';
import app from '../src/server/api/app';

// Export Hono app as Vercel serverless function
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

// Use Node.js runtime because better-auth with Drizzle adapter
// requires Node.js modules that are not available in Edge Runtime
export const config = {
    runtime: 'nodejs',
    maxDuration: 30
};
