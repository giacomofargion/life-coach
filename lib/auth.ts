import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getDb } from '@/lib/db/server';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const sql = getDb();

        // Find user by email
        const userResult = await sql`
          SELECT id, email, password_hash, name
          FROM users
          WHERE email = ${credentials.email}
        ` as Array<{ id: string; email: string; password_hash: string; name: string | null }>;

        if (!userResult || userResult.length === 0) {
          return null;
        }

        const user = userResult[0];

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }

      // Refresh user data when session is updated (e.g., after username/email change)
      if (trigger === 'update' && token.id) {
        const sql = getDb();
        const userResult = await sql`
          SELECT id, email, name
          FROM users
          WHERE id = ${token.id}
        ` as Array<{ id: string; email: string; name: string | null }>;

        if (userResult && userResult.length > 0) {
          const updatedUser = userResult[0];
          token.name = updatedUser.name || undefined;
          token.email = updatedUser.email;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | undefined;
        session.user.email = token.email as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
