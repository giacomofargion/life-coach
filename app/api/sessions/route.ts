import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/server';
import { requireAuth } from '@/lib/auth-helpers';
import { z } from 'zod';

const sessionSchema = z.object({
  session_type: z.enum(['morning', 'afternoon']),
  energy_level: z.enum(['low', 'medium', 'high']),
  main_activity_id: z.string().uuid().optional().nullable(),
  duration_minutes: z.number().int().positive().nullable().optional(),
});

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { session_type, energy_level, main_activity_id, duration_minutes } =
      sessionSchema.parse(body);

    const sql = getDb();

    // Create the session
    const newSession = await sql`
      INSERT INTO sessions (user_id, session_type, energy_level, duration_minutes)
      VALUES (${userId}, ${session_type}, ${energy_level}, ${duration_minutes})
      RETURNING id, user_id, session_type, energy_level, duration_minutes, created_at
    ` as Array<{
      id: string;
      user_id: string;
      session_type: 'morning' | 'afternoon';
      energy_level: 'low' | 'medium' | 'high';
      duration_minutes: number | null;
      created_at: Date;
    }>;

    if (!newSession || newSession.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    const sessionId = newSession[0].id;

    // Create session_activities entries
    const sessionActivities = [];

    if (main_activity_id) {
      // Verify the activity belongs to the user
      const activity = await sql`
        SELECT id FROM activities
        WHERE id = ${main_activity_id} AND user_id = ${userId}
      ` as Array<{ id: string }>;

      if (activity && activity.length > 0) {
        const mainActivity = await sql`
          INSERT INTO session_activities (session_id, activity_id, is_main, is_filler)
          VALUES (${sessionId}, ${main_activity_id}, true, false)
          RETURNING id, session_id, activity_id, is_main, is_filler
        ` as Array<{
          id: string;
          session_id: string;
          activity_id: string;
          is_main: boolean;
          is_filler: boolean;
        }>;

        if (mainActivity && mainActivity.length > 0) {
          sessionActivities.push(mainActivity[0]);
        }
      }
    }

    return NextResponse.json(
      {
        session: {
          ...newSession[0],
          created_at: newSession[0].created_at.toISOString(),
        },
        sessionActivities,
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

    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/sessions - Get all sessions for the current user with activities
export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const sql = getDb();

    // Fetch sessions
    const sessions = await sql`
      SELECT id, user_id, session_type, energy_level, duration_minutes, created_at
      FROM sessions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    ` as Array<{
      id: string;
      user_id: string;
      session_type: 'morning' | 'afternoon';
      energy_level: 'low' | 'medium' | 'high';
      duration_minutes: number | null;
      created_at: Date;
    }>;

    // Fetch activities for each session
    const sessionsWithActivities = await Promise.all(
      sessions.map(async (session) => {
        const sessionActivities = await sql`
          SELECT
            sa.id,
            sa.session_id,
            sa.activity_id,
            sa.is_main,
            sa.is_filler,
            a.name as activity_name,
            a.priority,
            a.effort_level
          FROM session_activities sa
          INNER JOIN activities a ON sa.activity_id = a.id
          WHERE sa.session_id = ${session.id}
          ORDER BY sa.is_main DESC
        ` as Array<{
          id: string;
          session_id: string;
          activity_id: string;
          is_main: boolean;
          is_filler: boolean;
          activity_name: string;
          priority: 'high' | 'medium' | 'low';
          effort_level: 'high' | 'medium' | 'low';
        }>;

        const mainActivity = sessionActivities.find((sa) => sa.is_main);

        return {
          ...session,
          created_at: session.created_at.toISOString(),
          mainActivity: mainActivity
            ? {
                id: mainActivity.activity_id,
                name: mainActivity.activity_name,
                priority: mainActivity.priority,
                effort_level: mainActivity.effort_level,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ sessions: sessionsWithActivities }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
