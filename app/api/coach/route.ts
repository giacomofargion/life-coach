import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/server';
import { requireAuth } from '@/lib/auth-helpers';
import { selectActivities } from '@/lib/coach/algorithm';
import { z } from 'zod';

const coachRequestSchema = z.object({
  session_type: z.enum(['morning', 'afternoon']),
  energy_level: z.enum(['low', 'medium', 'high']),
});

// POST /api/coach - Get coaching suggestion based on session and energy level
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { session_type, energy_level } = coachRequestSchema.parse(body);

    const sql = getDb();

    // Fetch user's activities
    const activities = await sql`
      SELECT id, user_id, name, priority, effort_level, created_at, updated_at
      FROM activities
      WHERE user_id = ${userId}
    ` as Array<{
      id: string;
      user_id: string;
      name: string;
      priority: 'high' | 'medium' | 'low';
      effort_level: 'high' | 'medium' | 'low';
      created_at: Date;
      updated_at: Date;
    }>;

    // Convert dates to strings for JSON serialization
    const activitiesWithStringDates = activities.map((activity) => ({
      ...activity,
      created_at: activity.created_at.toISOString(),
      updated_at: activity.updated_at.toISOString(),
    }));

    // Run the coaching algorithm
    const suggestion = selectActivities(
      activitiesWithStringDates,
      energy_level,
      session_type
    );

    return NextResponse.json({ suggestion }, { status: 200 });
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

    console.error('Error getting coaching suggestion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
