# Neon Database Setup Guide

## Database Setup

1. **Create a Neon project** at [https://neon.tech](https://neon.tech)

2. **Get your database connection string**:

   - Go to your project dashboard
   - Navigate to Connection Details
   - Copy your connection string (it will look like: `postgresql://user:password@host/database`)

3. **Configure environment variables**:

   - Copy `.env.local.example` to `.env.local`
   - Add your Neon credentials:
     ```
     DATABASE_URL=your_neon_connection_string
     NEXTAUTH_SECRET=your_generated_secret
     NEXTAUTH_URL=http://localhost:3000
     ```
   - Generate a NextAuth secret: `openssl rand -base64 32`

4. **Run the database migration**:

   - Go to your Neon project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `migrations/001_initial_schema.sql`
   - Run the migration

   Alternatively, if you have `psql` installed:

   ```bash
   psql $DATABASE_URL -f migrations/001_initial_schema.sql
   ```

## Database Schema

The migration creates the following tables:

- **users**: User accounts for authentication (NextAuth.js)
- **activities**: User-customizable activities with priority and effort levels
- **sessions**: Coaching sessions with session type and energy level
- **session_activities**: Junction table linking sessions to activities
- **quotes**: Optional table for storing coaching quotes

## Security Note

Unlike Supabase, Neon doesn't have built-in Row Level Security (RLS). Security is handled in application code:

- All API routes check authentication using `getCurrentUserId()` from `lib/auth-helpers.ts`
- All database queries filter by `user_id` to ensure users only access their own data
- Never trust client-side data - always verify user_id on the server
