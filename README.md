# Life Coach App

A mindful coaching application built with Next.js, TypeScript, Tailwind CSS v4, Neon, and NextAuth.js.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up Neon database:
   - Create a Neon project at [https://neon.tech](https://neon.tech)
   - Get your database connection string from the project dashboard
   - Copy `.env.local.example` to `.env.local` and add your credentials
   - Run the database migration (see `supabase/README.md` for details)

3. Set up NextAuth.js:
   - Generate a secret: `openssl rand -base64 32`
   - Add `NEXTAUTH_SECRET` to your `.env.local` file
   - Add `NEXTAUTH_URL=http://localhost:3000` for development

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - React components (UI, auth, coach, activities, history)
- `lib/` - Utility functions, types, database clients, auth, and coaching algorithm
- `supabase/migrations/` - Database migration files (works with Neon)

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS v4
- Shadcn UI
- Framer Motion
- Neon (Serverless PostgreSQL)
- NextAuth.js (Authentication)
