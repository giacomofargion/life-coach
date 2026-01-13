import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const sql = getDb();

    // Find valid token
    const tokenResult = await sql`
      SELECT prt.id, prt.user_id, prt.expires_at, prt.used_at
      FROM password_reset_tokens prt
      WHERE prt.token = ${token}
        AND prt.used_at IS NULL
        AND prt.expires_at > NOW()
    ` as Array<{
      id: string;
      user_id: string;
      expires_at: Date;
      used_at: Date | null;
    }>;

    if (!tokenResult || tokenResult.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const tokenRecord = tokenResult[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}
      WHERE id = ${tokenRecord.user_id}
    `;

    // Mark token as used
    await sql`
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE id = ${tokenRecord.id}
    `;

    return NextResponse.json({
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
