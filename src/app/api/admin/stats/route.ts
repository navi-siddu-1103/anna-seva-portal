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

    const [totalDistributors, pendingDistributors, totalCardholders, pendingChangeRequests] = await Promise.all([
      db.collection('distributors').countDocuments(),
      db.collection('distributors').countDocuments({ status: 'pending' }),
      db.collection('cardholders').countDocuments(),
      db.collection('distributorChangeRequests').countDocuments({ status: 'pending' }),
    ]);

    return NextResponse.json({
      success: true,
      stats: { totalDistributors, pendingDistributors, totalCardholders, pendingChangeRequests },
    });
  } catch (err) {
    console.error('[admin/stats]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
