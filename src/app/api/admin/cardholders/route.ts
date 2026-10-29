import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

function getAdmin(request: Request) {
  const token = request.headers.get('cookie')?.split('; ')
    .find(r => r.startsWith('token='))?.split('=')[1];
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    return decoded?.role === 'admin' ? decoded : null;
  } catch { return null; }
}

export async function GET(request: Request) {
  if (!getAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { client } = await connectToDatabase();
    const db = client.db();

    const cardholders = await db.collection('cardholders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, cardholders });
  } catch (err) {
    console.error('[admin/cardholders]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
