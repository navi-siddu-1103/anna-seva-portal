import { NextResponse } from 'next/server';

export async function GET() {
  // Served at runtime — not embedded at build time
  return NextResponse.json({
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  });
}
