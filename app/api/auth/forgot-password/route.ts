import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/server';
import crypto from 'crypto';
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

    const sql = getDb();

    // Find user by email
    const userResult = await sql`
      SELECT id, email, name
      FROM users
      WHERE email = ${email}
    ` as Array<{ id: string; email: string; name: string | null }>;

    // Don't reveal if user exists or not (security best practice)
    // Always return success, but only send email if user exists
    if (userResult && userResult.length > 0) {
      const user = userResult[0];

      // Generate secure random token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Invalidate any existing tokens for this user
      await sql`
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE user_id = ${user.id} AND used_at IS NULL
      `;

      // Store token in database
      await sql`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${token}, ${expiresAt})
      `;

      // Send password reset email
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      try {
        await sendPasswordResetEmail(user.email, user.name || 'there', token, baseUrl);
        console.log('Password reset email sent successfully to:', user.email);
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
