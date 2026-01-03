import { getRequestListener } from '@hono/node-server';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '@/server/api/app';

// Create Node.js compatible request listener from Hono app
const requestListener = getRequestListener(app.fetch);

// Export as Vercel Node.js Serverless Function
export default async function handler(req: VercelRequest, res: VercelResponse) {
    return requestListener(req, res);
}

// Use Node.js runtime because better-auth with Drizzle adapter
// requires Node.js modules that are not available in Edge Runtime
export const config = {
    runtime: 'nodejs',
    maxDuration: 30
};
