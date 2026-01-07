# Migration from Supabase to Neon

## What Changed

### Dependencies

- **Removed**: `@supabase/supabase-js`, `@supabase/ssr`
- **Added**: `@neondatabase/serverless`, `next-auth`, `bcryptjs`, `@types/bcryptjs`

### Database Client

- **Old**: `lib/supabase/client.ts` and `lib/supabase/server.ts` (Supabase clients)
- **New**: `lib/db/client.ts` and `lib/db/server.ts` (Neon serverless client)

### Authentication

- **Old**: Supabase Auth (built-in)
- **New**: NextAuth.js with credentials provider
- **Files**:
  - `lib/auth.ts` - NextAuth configuration
  - `lib/auth-helpers.ts` - Helper functions for getting current user
  - `app/api/auth/[...nextauth]/route.ts` - NextAuth API route
  - `app/api/auth/signup/route.ts` - User registration endpoint

### Database Schema

- **Added**: `users` table (for NextAuth.js)
- **Removed**: RLS policies (security handled in application code)
- **Updated**: Foreign keys now reference `users` table instead of `auth.users`

### Environment Variables

- **Old**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **New**: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

## Next Steps

1. **Install new dependencies**:

   ```bash
   npm install
   ```

2. **Set up Neon database**:

   - Create account at [https://neon.tech](https://neon.tech)
   - Create a new project
   - Copy your connection string

3. **Configure environment variables**:

   - Copy `.env.local.example` to `.env.local`
   - Add your `DATABASE_URL` from Neon
   - Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
   - Set `NEXTAUTH_URL=http://localhost:3000` (for development)

4. **Run database migration**:

   - Go to Neon SQL Editor
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Run the migration

5. **Test the setup**:
   ```bash
   npm run dev
   ```

## Important Notes

- **Security**: Unlike Supabase, Neon doesn't have Row Level Security. All security checks must be done in application code using `getCurrentUserId()` from `lib/auth-helpers.ts`
- **Queries**: Always filter by `user_id` in your database queries
- **API Routes**: Use `requireAuth()` or `getCurrentUserId()` to verify authentication before accessing data

## API Changes

### Authentication

- **Login**: Use NextAuth.js signin at `/api/auth/signin`
- **Signup**: POST to `/api/auth/signup` with `{ email, password, name? }`
- **Session**: Access via `getSession()` from `next-auth/react` (client) or `getServerSession(authOptions)` (server)

### Database Queries

- Use `getDb()` from `lib/db/server.ts` for server-side queries
- Use `sql` template tag for parameterized queries
- Always include `user_id` filter in WHERE clauses
