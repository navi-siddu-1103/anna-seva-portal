import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { verifyToken } from '@/lib/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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
        { error: 'Only cardholders can make payments' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'INR', receipt, notes } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount (in paise) is required' },
        { status: 400 }
      );
    }

    // Create Razorpay order (amount must be in paise)
    const order = await razorpay.orders.create({
      amount: Math.round(amount), // amount in paise
      currency,
      receipt: receipt ?? `rcpt_${Date.now()}`,
      notes: notes ?? {},
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error('Razorpay create-order error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
