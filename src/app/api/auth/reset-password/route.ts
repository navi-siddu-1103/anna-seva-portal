import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    const passwordResets = db.collection('passwordResets');
    const users = db.collection('users');

    // Find the reset record
    const resetRecord = await passwordResets.findOne({ token });

    if (!resetRecord) {
      return NextResponse.json({ error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 });
    }

    // Check expiry
    if (new Date() > new Date(resetRecord.expiresAt)) {
      await passwordResets.deleteOne({ token });
      return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // Hash new password
    const hashed = await hashPassword(password);

    // Update user password
    const result = await users.updateOne(
      { email: resetRecord.email },
      { $set: { password: hashed, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete the used token
    await passwordResets.deleteOne({ token });

    return NextResponse.json({ ok: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('[reset-password]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
