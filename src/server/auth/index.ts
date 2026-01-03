import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import * as schema from '../db/schema';

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications
        }
    }),

    // Email and password disabled - OAuth only
    emailAndPassword: {
        enabled: false
    },

    // OAuth Providers
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
            // Request additional scopes for repo access
            scope: ['user:email', 'repo']
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            // Request Drive scopes for file access
            scope: [
                'openid',
                'email',
                'profile',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/drive.metadata.readonly'
            ],
            // Enable offline access for refresh tokens
            accessType: 'offline',
            prompt: 'consent'
        }
    },

    // Session configuration
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update session every 24 hours
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5 // 5 minutes
        }
    },

    // Account linking
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ['github', 'google']
        }
    },

    // Base URL for callbacks
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5173',

    // Secret for signing
    secret: process.env.BETTER_AUTH_SECRET,

    // Trust host in production
    trustedOrigins: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://qazuor-markview.vercel.app',
        process.env.NEXT_PUBLIC_APP_URL || ''
    ].filter(Boolean),

    // Advanced cookie configuration for production
    advanced: {
        cookiePrefix: 'markview',
        // Use secure cookies only in production
        useSecureCookies: process.env.NODE_ENV === 'production',
        // Cookie configuration
        defaultCookieAttributes: {
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            path: '/'
        }
    }
});

// Export type for client
export type Auth = typeof auth;
