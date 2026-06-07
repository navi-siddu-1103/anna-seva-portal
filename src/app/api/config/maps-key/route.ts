import { NextResponse } from 'next/server';

export async function GET() {
  // This runs server-side at RUNTIME — can always read env vars
  return NextResponse.json({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });
}
