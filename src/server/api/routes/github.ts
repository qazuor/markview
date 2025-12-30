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

const githubRoutes = new Hono<{ Variables: Variables }>();

// ============================================================================
// Schemas
// ============================================================================

const proxySchema = z.object({
    endpoint: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
    body: z.unknown().optional()
});

const commitSchema = z.object({
    repo: z.string(), // owner/repo
    path: z.string(),
    content: z.string(),
    message: z.string().min(1),
    sha: z.string().optional(), // Required for updates
    branch: z.string().optional()
});

// ============================================================================
// Helper Functions
// ============================================================================

async function getGitHubToken(userId: string): Promise<string | null> {
    const account = await db.query.accounts.findFirst({
        where: and(eq(accounts.userId, userId), eq(accounts.providerId, 'github'))
    });

    return account?.accessToken || null;
}

// ============================================================================
// Routes
// ============================================================================

// POST /api/github/proxy - Proxy GitHub API requests
githubRoutes.post('/proxy', zValidator('json', proxySchema), async (c) => {
    const user = getAuthUser(c);
    const { endpoint, method, body } = c.req.valid('json');

    const token = await getGitHubToken(user.id);
    if (!token) {
        return c.json({ error: 'GitHub not connected' }, 401);
    }

    const url = endpoint.startsWith('https://') ? endpoint : `https://api.github.com${endpoint}`;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        });

        const data = await response.json();

        // Forward rate limit headers
        const rateLimit = {
            limit: response.headers.get('x-ratelimit-limit'),
            remaining: response.headers.get('x-ratelimit-remaining'),
            reset: response.headers.get('x-ratelimit-reset')
        };

        if (!response.ok) {
            return c.json(
                {
                    error: data.message || 'GitHub API error',
                    status: response.status,
                    rateLimit
                },
                response.status as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500
            );
        }

        return c.json({ data, rateLimit });
    } catch (error) {
        console.error('GitHub proxy error:', error);
        return c.json({ error: 'Failed to connect to GitHub' }, 500);
    }
});

// POST /api/github/commit - Create commit (create/update/delete file)
githubRoutes.post('/commit', zValidator('json', commitSchema), async (c) => {
    const user = getAuthUser(c);
    const { repo, path, content, message, sha, branch } = c.req.valid('json');

    const token = await getGitHubToken(user.id);
    if (!token) {
        return c.json({ error: 'GitHub not connected' }, 401);
    }

    // Get default branch if not specified
    let targetBranch = branch;
    if (!targetBranch) {
        const repoResponse = await fetch(`https://api.github.com/repos/${repo}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json'
            }
        });
        const repoData = await repoResponse.json();
        targetBranch = repoData.default_branch;
    }

    // Create or update file
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    const body: Record<string, string> = {
        message,
        content: Buffer.from(content).toString('base64'),
        branch: targetBranch || 'main'
    };

    // Include sha for updates (required by GitHub API)
    if (sha) {
        body.sha = sha;
    }

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle conflict (file changed on remote)
            if (response.status === 409) {
                return c.json(
                    {
                        error: 'Conflict',
                        message: 'File has been modified on GitHub. Please refresh and try again.',
                        details: data
                    },
                    409
                );
            }

            return c.json(
                {
                    error: data.message || 'Failed to commit',
                    status: response.status
                },
                response.status as 400 | 401 | 403 | 404 | 422 | 500
            );
        }

        return c.json({
            success: true,
            sha: data.content?.sha,
            commit: {
                sha: data.commit?.sha,
                url: data.commit?.html_url
            }
        });
    } catch (error) {
        console.error('GitHub commit error:', error);
        return c.json({ error: 'Failed to commit to GitHub' }, 500);
    }
});

// DELETE /api/github/file - Delete file from repo
githubRoutes.delete(
    '/file',
    zValidator(
        'json',
        z.object({
            repo: z.string(),
            path: z.string(),
            message: z.string(),
            sha: z.string(),
            branch: z.string().optional()
        })
    ),
    async (c) => {
        const user = getAuthUser(c);
        const { repo, path, message, sha, branch } = c.req.valid('json');

        const token = await getGitHubToken(user.id);
        if (!token) {
            return c.json({ error: 'GitHub not connected' }, 401);
        }

        const url = `https://api.github.com/repos/${repo}/contents/${path}`;

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    sha,
                    branch: branch || 'main'
                })
            });

            if (!response.ok) {
                const data = await response.json();
                return c.json(
                    {
                        error: data.message || 'Failed to delete',
                        status: response.status
                    },
                    response.status as 400 | 401 | 403 | 404 | 409 | 500
                );
            }

            return c.json({ success: true });
        } catch (error) {
            console.error('GitHub delete error:', error);
            return c.json({ error: 'Failed to delete from GitHub' }, 500);
        }
    }
);

// GET /api/github/connection - Check GitHub connection status
githubRoutes.get('/connection', async (c) => {
    const user = getAuthUser(c);

    const account = await db.query.accounts.findFirst({
        where: and(eq(accounts.userId, user.id), eq(accounts.providerId, 'github'))
    });

    if (!account || !account.accessToken) {
        return c.json({ connected: false });
    }

    // Verify token is still valid
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${account.accessToken}`,
                Accept: 'application/vnd.github+json'
            }
        });

        if (!response.ok) {
            return c.json({ connected: false, error: 'Token expired' });
        }

        const userData = await response.json();

        return c.json({
            connected: true,
            user: {
                login: userData.login,
                name: userData.name,
                avatar: userData.avatar_url
            }
        });
    } catch {
        return c.json({ connected: false, error: 'Failed to verify' });
    }
});

export default githubRoutes;
