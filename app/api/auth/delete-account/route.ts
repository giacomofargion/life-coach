import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { getDb } from '@/lib/db/server';

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const sql = getDb();

    // Delete user (CASCADE will automatically delete all related data:
    // activities, sessions, session_activities, and nudges)
    await sql`
      DELETE FROM users
      WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);

    // If it's an auth error, return 401
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
