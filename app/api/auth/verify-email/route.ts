import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_token', request.url)
      );
    }

    const sql = getDb();

    // Find valid token
    const tokenResult = await sql`
      SELECT evt.id, evt.user_id, evt.new_email, evt.expires_at, evt.used_at
      FROM email_verification_tokens evt
      WHERE evt.token = ${token}
        AND evt.used_at IS NULL
        AND evt.expires_at > NOW()
    ` as Array<{
      id: string;
      user_id: string;
      new_email: string;
      expires_at: Date;
      used_at: Date | null;
    }>;

    if (!tokenResult || tokenResult.length === 0) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_or_expired_token', request.url)
      );
    }

    const tokenRecord = tokenResult[0];

    // Check if new email is still available (might have been taken since request)
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${tokenRecord.new_email}
    ` as Array<{ id: string }>;

    if (existingUser && existingUser.length > 0) {
      // Mark token as used even though we can't complete the change
      await sql`
        UPDATE email_verification_tokens
        SET used_at = NOW()
        WHERE id = ${tokenRecord.id}
      `;
      return NextResponse.redirect(
        new URL('/login?error=email_already_in_use', request.url)
      );
    }

    // Update user's email
    await sql`
      UPDATE users
      SET email = ${tokenRecord.new_email}
      WHERE id = ${tokenRecord.user_id}
    `;

    // Mark token as used
    await sql`
      UPDATE email_verification_tokens
      SET used_at = NOW()
      WHERE id = ${tokenRecord.id}
    `;

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL('/login?email_verified=true', request.url)
    );
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.redirect(
      new URL('/login?error=verification_failed', request.url)
    );
  }
}
