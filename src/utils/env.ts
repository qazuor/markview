/**
 * Environment variable access with type safety
 */
export const env = {
    get githubClientId(): string {
        return import.meta.env.VITE_GITHUB_CLIENT_ID ?? '';
    },

    get githubRedirectUri(): string {
        return import.meta.env.VITE_GITHUB_REDIRECT_URI ?? '';
    },

    get cloudinaryCloudName(): string {
        return import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '';
    },

    get cloudinaryUploadPreset(): string {
        return import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '';
    },

    get isDev(): boolean {
        return import.meta.env.DEV;
    },

    get isProd(): boolean {
        return import.meta.env.PROD;
    }
};

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
    const required: (keyof typeof env)[] = [];

    // In production, GitHub OAuth is required
    if (env.isProd) {
        // Add required vars for production
    }

    const missing = required.filter((key) => !env[key]);

    if (missing.length > 0) {
        console.warn(`Missing environment variables: ${missing.join(', ')}`);
    }
}
