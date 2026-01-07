import { neon } from '@neondatabase/serverless';

// Server-side database client
// Neon serverless client works the same on server and client
export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  return neon(process.env.DATABASE_URL);
}
