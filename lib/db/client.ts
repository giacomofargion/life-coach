import { neon } from '@neondatabase/serverless';

// Create a Neon database client
const sql = neon(process.env.DATABASE_URL!);

// Export the SQL client for raw queries
export { sql };

// For future use with Drizzle ORM (optional):
// import { drizzle } from 'drizzle-orm/neon-http';
// export const db = drizzle(sql);
