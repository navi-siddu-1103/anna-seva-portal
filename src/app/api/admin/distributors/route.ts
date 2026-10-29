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

// GET /api/admin/distributors?status=pending|active|all
export async function GET(request: Request) {
  if (!getAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending' | 'active' | 'rejected' | null (all)

    const { client } = await connectToDatabase();
    const db = client.db();

    const query = status && status !== 'all' ? { status } : {};
    const distributors = await db.collection('distributors')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, distributors });
  } catch (err) {
    console.error('[admin/distributors GET]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
