import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Get the current user's session on the server
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Get the current user's ID from the session
 * Returns null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id || null;
}

/**
 * Require authentication - throws error if user is not authenticated
 * Use in API routes and server components that require auth
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}
