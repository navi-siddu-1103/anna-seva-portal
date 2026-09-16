import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Get token from cookies
    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
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

    // Get the latest distribution cycles (announced or ongoing)
    const cycles = await distributionCycles
      .find({ status: { $in: ['announced', 'ongoing'] } })
      .sort({ cycleStartDate: -1 })
      .limit(5)
      .toArray();

    // Get the latest cycle if any
    const latestCycle = cycles.length > 0 ? cycles[0] : null;

    return NextResponse.json({ 
      success: true, 
      data: cycles,
      latest: latestCycle
    });
  } catch (err) {
    console.error('Get distribution cycles error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
