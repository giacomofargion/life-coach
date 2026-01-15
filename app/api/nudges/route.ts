import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/server';
import { requireAuth } from '@/lib/auth-helpers';
import { z } from 'zod';

const createNudgeSchema = z.object({
  content: z.string().min(1, 'Content is required').max(150, 'Content must be 150 characters or less'),
});

// POST /api/nudges - Create new nudge
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { content } = createNudgeSchema.parse(body);

    const sql = getDb();

    // Create the nudge
    const newNudge = await sql`
      INSERT INTO nudges (user_id, content)
      VALUES (${userId}, ${content})
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

    if (!newNudge || newNudge.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create nudge' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        nudge: {
          ...newNudge[0],
          completed_at: newNudge[0].completed_at?.toISOString() || null,
          created_at: newNudge[0].created_at.toISOString(),
          updated_at: newNudge[0].updated_at.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof z.ZodError) {
      // Zod v4 exposes validation problems via the `issues` array
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating nudge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/nudges - Get user's nudges
export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const { searchParams } = new URL(request.url);
    const includeCompleted = searchParams.get('completed') === 'true';

    const sql = getDb();

    // Fetch nudges based on completion status
    let nudges;
    if (includeCompleted) {
      nudges = await sql`
        SELECT id, user_id, content, is_completed, completed_at, created_at, updated_at
        FROM nudges
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      ` as Array<{
        id: string;
        user_id: string;
        content: string;
        is_completed: boolean;
        completed_at: Date | null;
        created_at: Date;
        updated_at: Date;
      }>;
    } else {
      // Default: only active (uncompleted) nudges
      nudges = await sql`
        SELECT id, user_id, content, is_completed, completed_at, created_at, updated_at
        FROM nudges
        WHERE user_id = ${userId} AND is_completed = false
        ORDER BY created_at DESC
      ` as Array<{
        id: string;
        user_id: string;
        content: string;
        is_completed: boolean;
        completed_at: Date | null;
        created_at: Date;
        updated_at: Date;
      }>;
    }

    const nudgesWithStringDates = nudges.map((nudge) => ({
      ...nudge,
      completed_at: nudge.completed_at?.toISOString() || null,
      created_at: nudge.created_at.toISOString(),
      updated_at: nudge.updated_at.toISOString(),
    }));

    // Get count of active nudges
    const activeCountResult = await sql`
      SELECT COUNT(*) as count
      FROM nudges
      WHERE user_id = ${userId} AND is_completed = false
    ` as Array<{ count: bigint }>;

    const activeCount = Number(activeCountResult[0]?.count || 0);

    return NextResponse.json(
      {
        nudges: nudgesWithStringDates,
        activeCount,
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

    console.error('Error fetching nudges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
