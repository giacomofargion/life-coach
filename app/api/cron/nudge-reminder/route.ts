import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/server';
import { sendNudgeEmail } from '@/lib/nudges/send-email';
import { Nudge } from '@/lib/types';

/**
 * Cron job endpoint to send daily nudge reminder emails
 * Configured in vercel.json to run daily at 8am UTC
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is being called by Vercel Cron (optional but recommended)
    // In production, Vercel adds authorization headers automatically
    // You can also set CRON_SECRET for extra security
    if (process.env.CRON_SECRET) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const sql = getDb();
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Query all users with active nudges, grouped by user
    const usersWithNudges = await sql`
      SELECT DISTINCT u.id, u.email, u.name
      FROM users u
      INNER JOIN nudges n ON n.user_id = u.id
      WHERE n.is_completed = false
      ORDER BY u.id
    ` as Array<{
      id: string;
      email: string;
      name: string | null;
    }>;

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as Array<{ userId: string; error: string }>,
    };

    // Process each user
    for (const user of usersWithNudges) {
      try {
        // Get all active nudges for this user
        // Double-check they're still active (race condition protection)
        const activeNudges = await sql`
          SELECT id, user_id, content, is_completed, completed_at, created_at, updated_at
          FROM nudges
          WHERE user_id = ${user.id} AND is_completed = false
          ORDER BY created_at ASC
        ` as Array<{
          id: string;
          user_id: string;
          content: string;
          is_completed: boolean;
          completed_at: Date | null;
          created_at: Date;
          updated_at: Date;
        }>;

        // Skip if user has no active nudges (they may have completed them since query)
        if (activeNudges.length === 0) {
          results.processed++;
          continue;
        }

        // Convert to Nudge type with string dates
        const nudges: Nudge[] = activeNudges.map((nudge) => ({
          ...nudge,
          completed_at: nudge.completed_at?.toISOString() || null,
          created_at: nudge.created_at.toISOString(),
          updated_at: nudge.updated_at.toISOString(),
        }));

        // Send email with all active nudges
        await sendNudgeEmail(user.email, user.name, nudges, baseUrl);

        results.sent++;
        results.processed++;
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        results.failed++;
        results.processed++;
        results.errors.push({
          userId: user.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Processed ${results.processed} users, sent ${results.sent} emails, ${results.failed} failed`,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in nudge reminder cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also allow GET for testing
export async function GET(request: NextRequest) {
  return POST(request);
}
