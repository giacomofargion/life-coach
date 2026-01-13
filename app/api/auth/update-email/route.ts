import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { getDb } from '@/lib/db/server';
import crypto, { createHash } from 'crypto';
import { sendEmailVerificationEmail } from '@/lib/auth/send-email';
import { z } from 'zod';

const updateEmailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { newEmail } = updateEmailSchema.parse(body);

    const sql = getDb();

    // Get current user info
    const userResult = await sql`
      SELECT email, name
      FROM users
      WHERE id = ${userId}
    ` as Array<{ email: string; name: string | null }>;

    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // Check if new email is different
    if (user.email.toLowerCase() === newEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'New email must be different from current email' },
        { status: 400 }
      );
    }

    // Check if email is already in use
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${newEmail.toLowerCase()}
    ` as Array<{ id: string }>;

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'This email is already in use' },
        { status: 400 }
      );
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Hash token before storing (plaintext token is sent in email, only hash is stored)
    const hashedToken = createHash('sha256').update(token).digest('hex');

    // Invalidate any existing tokens for this user
    await sql`
      UPDATE email_verification_tokens
      SET used_at = NOW()
      WHERE user_id = ${userId} AND used_at IS NULL
    `;

    // Store hashed token in database
    await sql`
      INSERT INTO email_verification_tokens (user_id, new_email, token, expires_at)
      VALUES (${userId}, ${newEmail.toLowerCase()}, ${hashedToken}, ${expiresAt})
    `;

    // Send verification email
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    try {
      await sendEmailVerificationEmail(
        newEmail.toLowerCase(),
        user.name,
        token,
        baseUrl
      );
      console.log('Email verification email sent successfully');
    } catch (emailError) {
      console.error('Error sending email verification email:', emailError);
      // Delete the token since email failed to send
      await sql`
        DELETE FROM email_verification_tokens
        WHERE token = ${token}
      `;
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification email sent to your new email address',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    // If it's an auth error, return 401
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Update email error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate email change' },
      { status: 500 }
    );
  }
}
