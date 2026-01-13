import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { getDb } from '@/lib/db/server';
import { z } from 'zod';

const updateUsernameSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { name } = updateUsernameSchema.parse(body);

    const sql = getDb();

    // Update user's name
    await sql`
      UPDATE users
      SET name = ${name}
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      message: 'Username updated successfully',
      name,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
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

    console.error('Update username error:', error);
    return NextResponse.json(
      { error: 'Failed to update username' },
      { status: 500 }
    );
  }
}
