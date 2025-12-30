import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Create Neon SQL client
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
}
const sql = neon(databaseUrl);

// Create database client with schema for relations
export const db = drizzle(sql, { schema });

// Export schema for convenience
export * from './schema';

// Export types
export type Database = typeof db;
