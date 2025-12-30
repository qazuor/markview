import { zValidator } from '@hono/zod-validator';
import type { Session, User } from 'better-auth';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { accounts, db } from '../../db';
import { getAuthUser } from '../middleware/auth';

type Variables = {
    user: User | null;
    session: Session | null;
};

const googleRoutes = new Hono<{ Variables: Variables }>();

// ============================================================================
// Schemas
// ============================================================================

const proxySchema = z.object({
    endpoint: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
    body: z.unknown().optional(),
    isUpload: z.boolean().optional() // For multipart uploads
});

const fileOperationSchema = z.object({
    operation: z.enum(['create', 'update', 'delete', 'rename', 'move']),
    fileId: z.string().optional(), // Required for update/delete/rename/move
    name: z.string().optional(), // For create/rename
    content: z.string().optional(), // For create/update
    parentId: z.string().optional(), // For create/move
    mimeType: z.string().optional()
});

// ============================================================================
// Helper Functions
// ============================================================================

async function getGoogleToken(userId: string): Promise<string | null> {
    const account = await db.query.accounts.findFirst({
        where: and(eq(accounts.userId, userId), eq(accounts.providerId, 'google'))
    });

    if (!account?.accessToken) {
        return null;
    }

    // Check if token is expired and needs refresh
    if (account.accessTokenExpiresAt && new Date(account.accessTokenExpiresAt) < new Date()) {
        // Token expired, try to refresh
        if (account.refreshToken) {
            const newToken = await refreshGoogleToken(userId, account.refreshToken);
            return newToken;
        }
        return null;
    }

    return account.accessToken;
}

async function refreshGoogleToken(userId: string, refreshToken: string): Promise<string | null> {
    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID || '',
                client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            })
        });

        if (!response.ok) {
            console.error('Failed to refresh Google token');
            return null;
        }

        const data = await response.json();

        // Update token in database
        await db
            .update(accounts)
            .set({
                accessToken: data.access_token,
                accessTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
                updatedAt: new Date()
            })
            .where(and(eq(accounts.userId, userId), eq(accounts.providerId, 'google')));

        return data.access_token;
    } catch (error) {
        console.error('Error refreshing Google token:', error);
        return null;
    }
}

// ============================================================================
// Routes
// ============================================================================

// POST /api/google/proxy - Proxy Google API requests
googleRoutes.post('/proxy', zValidator('json', proxySchema), async (c) => {
    const user = getAuthUser(c);
    const { endpoint, method, body } = c.req.valid('json');

    const token = await getGoogleToken(user.id);
    if (!token) {
        return c.json({ error: 'Google Drive not connected' }, 401);
    }

    const url = endpoint.startsWith('https://') ? endpoint : `https://www.googleapis.com${endpoint}`;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        });

        // Handle file download (binary content)
        if (endpoint.includes('alt=media')) {
            const text = await response.text();
            return c.json({ content: text });
        }

        const data = await response.json();

        if (!response.ok) {
            return c.json(
                {
                    error: data.error?.message || 'Google API error',
                    status: response.status
                },
                response.status as 400 | 401 | 403 | 404 | 429 | 500
            );
        }

        return c.json({ data });
    } catch (error) {
        console.error('Google proxy error:', error);
        return c.json({ error: 'Failed to connect to Google' }, 500);
    }
});

// POST /api/google/files - File operations (create, update, delete, rename, move)
googleRoutes.post('/files', zValidator('json', fileOperationSchema), async (c) => {
    const user = getAuthUser(c);
    const { operation, fileId, name, content, parentId, mimeType } = c.req.valid('json');

    const token = await getGoogleToken(user.id);
    if (!token) {
        return c.json({ error: 'Google Drive not connected' }, 401);
    }

    try {
        let response: Response;
        let result: Record<string, unknown>;

        switch (operation) {
            case 'create': {
                // Create file with multipart upload
                const metadata = {
                    name: name || 'Untitled.md',
                    mimeType: mimeType || 'text/markdown',
                    parents: parentId ? [parentId] : undefined
                };

                const boundary = '-------314159265358979323846';
                const delimiter = `\r\n--${boundary}\r\n`;
                const closeDelimiter = `\r\n--${boundary}--`;

                const multipartBody = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}${delimiter}Content-Type: text/markdown\r\n\r\n${content || ''}${closeDelimiter}`;

                response = await fetch(
                    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime',
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': `multipart/related; boundary="${boundary}"`
                        },
                        body: multipartBody
                    }
                );
                break;
            }

            case 'update': {
                if (!fileId) {
                    return c.json({ error: 'fileId required for update' }, 400);
                }

                response = await fetch(
                    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,name,modifiedTime`,
                    {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'text/markdown'
                        },
                        body: content || ''
                    }
                );
                break;
            }

            case 'delete': {
                if (!fileId) {
                    return c.json({ error: 'fileId required for delete' }, 400);
                }

                // Move to trash instead of permanent delete
                response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ trashed: true })
                });
                break;
            }

            case 'rename': {
                if (!fileId || !name) {
                    return c.json({ error: 'fileId and name required for rename' }, 400);
                }

                response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,modifiedTime`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name })
                });
                break;
            }

            case 'move': {
                if (!fileId || !parentId) {
                    return c.json({ error: 'fileId and parentId required for move' }, 400);
                }

                // First get current parents
                const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const fileData = await fileResponse.json();
                const previousParents = (fileData.parents || []).join(',');

                response = await fetch(
                    `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${parentId}&removeParents=${previousParents}&fields=id,name,parents`,
                    {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                break;
            }

            default:
                return c.json({ error: 'Invalid operation' }, 400);
        }

        result = await response.json();

        if (!response.ok) {
            return c.json(
                {
                    error: (result as { error?: { message?: string } }).error?.message || 'Operation failed',
                    status: response.status
                },
                response.status as 400 | 401 | 403 | 404 | 500
            );
        }

        return c.json({ success: true, file: result });
    } catch (error) {
        console.error('Google file operation error:', error);
        return c.json({ error: 'File operation failed' }, 500);
    }
});

// GET /api/google/quota - Get storage quota
googleRoutes.get('/quota', async (c) => {
    const user = getAuthUser(c);

    const token = await getGoogleToken(user.id);
    if (!token) {
        return c.json({ error: 'Google Drive not connected' }, 401);
    }

    try {
        const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            return c.json({ error: 'Failed to get quota' }, response.status as 401 | 403 | 500);
        }

        const data = await response.json();
        const quota = data.storageQuota;

        return c.json({
            used: Number.parseInt(quota.usage || '0'),
            limit: Number.parseInt(quota.limit || '0'),
            usedInDrive: Number.parseInt(quota.usageInDrive || '0'),
            usedInTrash: Number.parseInt(quota.usageInDriveTrash || '0')
        });
    } catch (error) {
        console.error('Google quota error:', error);
        return c.json({ error: 'Failed to get quota' }, 500);
    }
});

// GET /api/google/connection - Check Google connection status
googleRoutes.get('/connection', async (c) => {
    const user = getAuthUser(c);

    const account = await db.query.accounts.findFirst({
        where: and(eq(accounts.userId, user.id), eq(accounts.providerId, 'google'))
    });

    if (!account?.accessToken) {
        return c.json({ connected: false });
    }

    // Verify token is still valid
    try {
        const token = await getGoogleToken(user.id);
        if (!token) {
            return c.json({ connected: false, error: 'Token expired' });
        }

        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            return c.json({ connected: false, error: 'Token invalid' });
        }

        const userData = await response.json();

        return c.json({
            connected: true,
            user: {
                email: userData.email,
                name: userData.name,
                picture: userData.picture
            }
        });
    } catch {
        return c.json({ connected: false, error: 'Failed to verify' });
    }
});

export default googleRoutes;
