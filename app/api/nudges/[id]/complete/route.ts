import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/server';
import { verifyCompletionUrl } from '@/lib/nudges/email';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/nudges/[id]/complete - Email completion endpoint
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const nudgeId = params.id;
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get('sig');
    const expires = searchParams.get('expires');

    if (!signature || !expires) {
      return NextResponse.redirect(
        new URL(
          '/?error=invalid-link',
          process.env.NEXTAUTH_URL || 'http://localhost:3000'
        )
      );
    }

    // Verify the signature and expiration
    try {
      const isValid = verifyCompletionUrl(nudgeId, signature, expires);
      if (!isValid) {
        return NextResponse.redirect(
          new URL(
            '/?error=expired-link',
            process.env.NEXTAUTH_URL || 'http://localhost:3000'
          )
        );
      }
    } catch (error) {
      console.error('Error verifying completion URL:', error);
      return NextResponse.redirect(
        new URL(
          '/?error=verification-failed',
          process.env.NEXTAUTH_URL || 'http://localhost:3000'
        )
      );
    }

    const sql = getDb();

    // Check if nudge exists and is not already completed
    const existingNudge = await sql`
      SELECT id, user_id, is_completed
      FROM nudges
      WHERE id = ${nudgeId}
    ` as Array<{
      id: string;
      user_id: string;
      is_completed: boolean;
    }>;

    if (!existingNudge || existingNudge.length === 0) {
      return NextResponse.redirect(
        new URL(
          '/?error=nudge-not-found',
          process.env.NEXTAUTH_URL || 'http://localhost:3000'
        )
      );
    }

    if (existingNudge[0].is_completed) {
      // Already completed, redirect with success message
      return NextResponse.redirect(
        new URL(
          '/?nudge=already-completed',
          process.env.NEXTAUTH_URL || 'http://localhost:3000'
        )
      );
    }

    // Mark nudge as completed
    const updatedNudge = await sql`
      UPDATE nudges
      SET is_completed = true, completed_at = NOW()
      WHERE id = ${nudgeId}
      RETURNING id
    ` as Array<{ id: string }>;

    if (!updatedNudge || updatedNudge.length === 0) {
      return NextResponse.redirect(
        new URL(
          '/?error=completion-failed',
          process.env.NEXTAUTH_URL || 'http://localhost:3000'
        )
      );
    }

    // Success! Redirect to home with success message
    return NextResponse.redirect(
      new URL(
        '/?nudge=completed',
        process.env.NEXTAUTH_URL || 'http://localhost:3000'
      )
    );
  } catch (error) {
    console.error('Error completing nudge:', error);
    return NextResponse.redirect(
      new URL(
        '/?error=internal-error',
        process.env.NEXTAUTH_URL || 'http://localhost:3000'
      )
    );
  }
}
