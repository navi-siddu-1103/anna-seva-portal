import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';

async function seedAdmin() {
  const { client } = await connectToDatabase();
  const db = client.db();
  const users = db.collection('users');

  const existing = await users.findOne({ email: 'admin@gmail.com' });
  if (existing) {
    return { ok: true, message: 'Admin user already exists. You can log in with admin@gmail.com / admin123' };
  }

  const hashed = await hashPassword('admin123');
  await users.insertOne({
    name: 'Admin',
    email: 'admin@gmail.com',
    password: hashed,
    role: 'admin',
    createdAt: new Date(),
  });

  return { ok: true, message: 'Admin user created successfully! Login with admin@gmail.com / admin123' };
}

// GET — so you can just visit this URL in the browser
export async function GET() {
  try {
    const result = await seedAdmin();
    return NextResponse.json(result);
  } catch (err) {
    console.error('[admin/seed]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST — for programmatic use
export async function POST() {
  try {
    const result = await seedAdmin();
    return NextResponse.json(result);
  } catch (err) {
    console.error('[admin/seed]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
