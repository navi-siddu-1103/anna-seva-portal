import { NextResponse } from 'next/server';

// GET — triggered when clicking an <a href="/api/auth/logout"> link
export async function GET() {
  const res = NextResponse.redirect(
    new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002')
  );
  res.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
  return res;
}

// POST — for programmatic logout calls
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
  return res;
}
