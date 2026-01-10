import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/server';
import { requireAuth } from '@/lib/auth-helpers';

interface RouteParams {
  params: {
    id: string;
  };
}

// PATCH /api/nudges/[id] - Update nudge (mark as complete)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await requireAuth();
    const nudgeId = params.id;

    const sql = getDb();

    // Verify the nudge belongs to the user and is not already completed
    const existingNudge = await sql`
      SELECT id, is_completed
      FROM nudges
      WHERE id = ${nudgeId} AND user_id = ${userId}
    ` as Array<{
      id: string;
      is_completed: boolean;
    }>;

    if (!existingNudge || existingNudge.length === 0) {
      return NextResponse.json(
        { error: 'Nudge not found' },
        { status: 404 }
      );
    }

    if (existingNudge[0].is_completed) {
      return NextResponse.json(
        { error: 'Nudge already completed' },
        { status: 400 }
      );
    }

    // Mark nudge as completed
    const updatedNudge = await sql`
      UPDATE nudges
      SET is_completed = true, completed_at = NOW()
      WHERE id = ${nudgeId} AND user_id = ${userId}
      RETURNING id, user_id, content, is_completed, completed_at, created_at, updated_at
    ` as Array<{
      id: string;
      user_id: string;
      content: string;
      is_completed: boolean;
      completed_at: Date | null;
      created_at: Date;
      updated_at: Date;
    }>;

    if (!updatedNudge || updatedNudge.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update nudge' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        nudge: {
          ...updatedNudge[0],
          completed_at: updatedNudge[0].completed_at?.toISOString() || null,
          created_at: updatedNudge[0].created_at.toISOString(),
          updated_at: updatedNudge[0].updated_at.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Error updating nudge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
