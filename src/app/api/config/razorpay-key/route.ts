import { NextResponse } from 'next/server';

/**
 * Expose the Razorpay public key to the client safely.
 * Only the KEY_ID (public) is returned — never the secret.
 */
export async function GET() {
  const keyId = process.env.RAZORPAY_KEY_ID;

  if (!keyId) {
    return NextResponse.json(
      { error: 'Razorpay is not configured on this server.' },
      { status: 503 }
    );
  }

  return NextResponse.json({ keyId });
}
