import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyPassword, createToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    const users = db.collection('users');

    // Case-insensitive email lookup to handle any casing inconsistencies
    const user = await users.findOne({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // If a role was specified (e.g. 'distributor'), allow admin to also pass through
    if (role && user.role !== role && user.role !== 'admin') {
      return NextResponse.json({ error: 'Invalid credentials for this login page' }, { status: 403 });
    }

    const token = createToken({ userId: user._id.toString(), email: user.email, role: user.role || 'cardholder' });
    const res = NextResponse.json({ ok: true, role: user.role || 'cardholder', name: user.name });
    res.cookies.set('token', token, { httpOnly: true, path: '/', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
