import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/server';
import { requireAuth } from '@/lib/auth-helpers';
import { z } from 'zod';

const activitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  priority: z.enum(['high', 'medium', 'low']),
  effort_level: z.enum(['high', 'medium', 'low']),
});

// GET /api/activities - Get all activities for the current user
export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const sql = getDb();

    const activities = await sql`
      SELECT id, user_id, name, priority, effort_level, created_at, updated_at
      FROM activities
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    ` as Array<{
      id: string;
      user_id: string;
      name: string;
      priority: 'high' | 'medium' | 'low';
      effort_level: 'high' | 'medium' | 'low';
      created_at: Date;
      updated_at: Date;
    }>;

    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create a new activity
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { name, priority, effort_level } = activitySchema.parse(body);

    const sql = getDb();

    const newActivity = await sql`
      INSERT INTO activities (user_id, name, priority, effort_level)
      VALUES (${userId}, ${name}, ${priority}, ${effort_level})
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

    if (!newActivity || newActivity.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create activity' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { activity: newActivity[0] },
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

    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
