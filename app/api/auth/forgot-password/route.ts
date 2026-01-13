import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/server';
import crypto, { createHash } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/auth/send-email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Normalize email: trim whitespace and convert to lowercase for case-insensitive lookup
    const normalizedEmail = email.trim().toLowerCase();

    const sql = getDb();

    // Find user by email (case-insensitive comparison)
    const userResult = await sql`
      SELECT id, email, name
      FROM users
      WHERE LOWER(email) = ${normalizedEmail}
    ` as Array<{ id: string; email: string; name: string | null }>;

    // Don't reveal if user exists or not (security best practice)
    // Always return success, but only send email if user exists
    if (userResult && userResult.length > 0) {
      const user = userResult[0];

      // Generate secure random token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Hash token before storing (plaintext token is sent in email, only hash is stored)
      const hashedToken = createHash('sha256').update(token).digest('hex');

      // Invalidate any existing tokens for this user
      await sql`
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE user_id = ${user.id} AND used_at IS NULL
      `;

      // Store hashed token in database
      await sql`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${hashedToken}, ${expiresAt})
      `;

      // Send password reset email
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      try {
        await sendPasswordResetEmail(user.email, user.name || 'there', token, baseUrl);
        console.log('Password reset email sent successfully');
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        // Still return success to prevent email enumeration, but log the error
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
