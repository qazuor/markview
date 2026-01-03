import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '@/server/api/app';

// Use Node.js runtime because better-auth with Drizzle adapter
// requires Node.js modules that are not available in Edge Runtime
export const config = {
    runtime: 'nodejs',
    maxDuration: 30
};

// Export as Vercel Node.js Serverless Function
// We manually construct the Request to avoid @hono/node-server body stream issues
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Build the full URL
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
        const url = new URL(req.url || '/', `${protocol}://${host}`);

        // Build headers
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
            if (value) {
                if (Array.isArray(value)) {
                    for (const v of value) {
                        headers.append(key, v);
                    }
                } else {
                    headers.set(key, value);
                }
            }
        }

        // Build body - Vercel pre-parses the body into req.body
        let body: string | null = null;
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            // If body is already parsed as object, stringify it
            if (typeof req.body === 'object') {
                body = JSON.stringify(req.body);
            } else if (typeof req.body === 'string') {
                body = req.body;
            }
        }

        // Create the Request object
        const request = new Request(url.toString(), {
            method: req.method || 'GET',
            headers,
            body
        });

        // Call Hono app
        const response = await app.fetch(request);

        // Copy response headers - special handling for Set-Cookie
        // Headers.forEach() only returns one value per key, but Set-Cookie can have multiple
        const setCookieHeaders = response.headers.getSetCookie?.() || [];

        response.headers.forEach((value, key) => {
            // Skip set-cookie as we handle it separately
            if (key.toLowerCase() !== 'set-cookie') {
                res.setHeader(key, value);
            }
        });

        // Set all cookies properly
        if (setCookieHeaders.length > 0) {
            res.setHeader('Set-Cookie', setCookieHeaders);
        }

        // Set status
        res.status(response.status);

        // Send body
        if (response.body) {
            const arrayBuffer = await response.arrayBuffer();
            res.send(Buffer.from(arrayBuffer));
        } else {
            res.end();
        }
    } catch (error) {
        console.error('Handler error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
