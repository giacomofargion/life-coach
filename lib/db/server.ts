import { neon } from '@neondatabase/serverless';

// Server-side database client
// Neon serverless client works the same on server and client
export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Clean up connection string - remove 'psql ' prefix and trailing quotes if present
  let connectionString = process.env.DATABASE_URL.trim();

  // Remove 'psql ' prefix if present
  if (connectionString.startsWith('psql ')) {
    connectionString = connectionString.substring(5);
  }

  // Remove leading/trailing single quotes if present
  if (connectionString.startsWith("'") && connectionString.endsWith("'")) {
    connectionString = connectionString.slice(1, -1);
  }

  return neon(connectionString);
}
