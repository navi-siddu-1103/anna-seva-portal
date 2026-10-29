import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('token='))?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'cardholder') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    const distributionCycles = db.collection('distributionCycles');

    // Only show cycles whose distribution date is today or in the future.
    // "End of today" = midnight of the NEXT day in IST (UTC+5:30).
    // We use end-of-day so a cycle for today stays visible for the whole day.
    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const cycles = await distributionCycles
      .find({
        status: { $in: ['announced', 'ongoing'] },
        cycleStartDate: { $gte: new Date(endOfToday.getTime() - 24 * 60 * 60 * 1000) }, // today or future
      })
      .sort({ cycleStartDate: 1 }) // nearest first
      .limit(5)
      .toArray();

    // Filter further in JS: keep only cycles whose start date is >= start of today
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const upcomingCycles = cycles.filter(
      (c: any) => new Date(c.cycleStartDate) >= startOfToday
    );

    const latestCycle = upcomingCycles.length > 0 ? upcomingCycles[0] : null;

    return NextResponse.json({
      success: true,
      cycles: upcomingCycles,
      latest: latestCycle,      // null when no upcoming cycle → UI shows "Waiting for next cycle"
    });
  } catch (err) {
    console.error('Get distribution cycles error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
