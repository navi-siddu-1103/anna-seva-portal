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
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    const cardholders = db.collection('cardholders');

    // Get all cardholders (for distributor view)
    const allCardholders = await cardholders
      .find({})
      .project({ userId: 0 }) // Exclude userId for security
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ 
      success: true, 
      data: allCardholders,
      count: allCardholders.length
    });
  } catch (err) {
    console.error('Get cardholders list error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
