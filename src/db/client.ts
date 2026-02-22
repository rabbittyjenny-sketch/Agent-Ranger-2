import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get the database URL from environment variables
const databaseUrl = import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Please configure your Neon PostgreSQL connection string.');
}

// Create a postgres client
const client = postgres(databaseUrl);

// Create and export the database instance
export const db = drizzle(client, { schema });

// Export schema for type safety
export * from './schema';
