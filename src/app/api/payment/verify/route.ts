import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Verify authentication
    const token = request.headers
      .get('cookie')
      ?.split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'cardholder') {
      return NextResponse.json(
        { error: 'Only cardholders can verify payments' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification fields' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error('Razorpay verify error: server key is not configured');
      return NextResponse.json(
        { error: 'Razorpay is not configured on this server.' },
        { status: 503 }
      );
    }

    // Verify the HMAC-SHA256 signature
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature. Payment verification failed.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      message: 'Payment verified successfully',
    });
  } catch (err: any) {
    console.error('Razorpay verify error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Payment verification failed' },
      { status: 500 }
    );
  }
}
