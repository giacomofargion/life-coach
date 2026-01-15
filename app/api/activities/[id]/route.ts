import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/server';
import { requireAuth } from '@/lib/auth-helpers';
import { z } from 'zod';

const activitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  priority: z.enum(['high', 'medium', 'low']),
  effort_level: z.enum(['high', 'medium', 'low']),
});

// PUT /api/activities/[id] - Update an activity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id: activityId } = await params;
    const body = await request.json();
    const { name, priority, effort_level } = activitySchema.parse(body);

    const sql = getDb();

    // Verify the activity belongs to the user
    const existing = await sql`
      SELECT id FROM activities
      WHERE id = ${activityId} AND user_id = ${userId}
    ` as Array<{ id: string }>;

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Update the activity
    const updated = await sql`
      UPDATE activities
      SET name = ${name}, priority = ${priority}, effort_level = ${effort_level}, updated_at = NOW()
      WHERE id = ${activityId} AND user_id = ${userId}
      RETURNING id, user_id, name, priority, effort_level, created_at, updated_at
    ` as Array<{
      id: string;
      user_id: string;
      name: string;
      priority: 'high' | 'medium' | 'low';
      effort_level: 'high' | 'medium' | 'low';
      created_at: Date;
      updated_at: Date;
    }>;

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update activity' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { activity: updated[0] },
      { status: 200 }
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

    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/activities/[id] - Delete an activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id: activityId } = await params;

    const sql = getDb();

    // Verify the activity belongs to the user and delete it
    const deleted = await sql`
      DELETE FROM activities
      WHERE id = ${activityId} AND user_id = ${userId}
      RETURNING id
    ` as Array<{ id: string }>;

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Activity deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
