import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    const { client } = await connectToDatabase();
    const db = client.db();
    const users = db.collection('users');

    const existing = await users.findOne({ email: 'admin@gmail.com' });
    if (existing) {
      return NextResponse.json({ ok: true, message: 'Admin user already exists.' });
    }

    const hashed = await hashPassword('admin123');
    await users.insertOne({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashed,
      role: 'admin',
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, message: 'Admin user created: admin@gmail.com / admin123' });
  } catch (err) {
    console.error('[admin/seed]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
