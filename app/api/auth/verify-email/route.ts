import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/server';
import { createHash } from 'crypto';

// This route always depends on dynamic URL search params, so we disable static optimization.
export const dynamic = 'force-dynamic';

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

    // Hash incoming token to compare with stored hash
    const hashedToken = createHash('sha256').update(token).digest('hex');

    // Find valid token (compare hashed tokens)
    const tokenResult = await sql`
      SELECT evt.id, evt.user_id, evt.new_email, evt.expires_at, evt.used_at
      FROM email_verification_tokens evt
      WHERE evt.token = ${hashedToken}
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

    // Check if new email is already taken (optimistic check)
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${tokenRecord.new_email}
    ` as Array<{ id: string }>;

    if (existingUser && existingUser.length > 0) {
      // Email already taken, mark token as used
      await sql`
        UPDATE email_verification_tokens
        SET used_at = NOW()
        WHERE id = ${tokenRecord.id}
      `;
      return NextResponse.redirect(
        new URL('/login?error=email_already_in_use', request.url)
      );
    }

    // Update user's email - UNIQUE constraint will catch any race condition
    // If another request claims this email between check and update,
    // PostgreSQL will throw a unique_violation error (code 23505)
    try {
      await sql`
        UPDATE users
        SET email = ${tokenRecord.new_email}
        WHERE id = ${tokenRecord.user_id}
      `;

      // Mark token as used only if email update succeeded
      await sql`
        UPDATE email_verification_tokens
        SET used_at = NOW()
        WHERE id = ${tokenRecord.id}
      `;
    } catch (updateError) {
      // Check if it's a unique constraint violation (race condition caught by DB)
      // PostgreSQL error code 23505 is unique_violation
      const isUniqueViolation =
        updateError &&
        typeof updateError === 'object' &&
        'code' in updateError &&
        updateError.code === '23505';

      if (isUniqueViolation) {
        // Email was taken between check and update due to race condition
        // Mark token as used to prevent retry attacks
        await sql`
          UPDATE email_verification_tokens
          SET used_at = NOW()
          WHERE id = ${tokenRecord.id}
        `;
        return NextResponse.redirect(
          new URL('/login?error=email_already_in_use', request.url)
        );
      }

      // Re-throw other errors to be handled by outer catch
      throw updateError;
    }

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
