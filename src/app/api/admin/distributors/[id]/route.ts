import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

function getAdmin(request: Request) {
  const token = request.headers.get('cookie')?.split('; ')
    .find(r => r.startsWith('token='))?.split('=')[1];
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    return decoded?.role === 'admin' ? decoded : null;
  } catch { return null; }
}

// PATCH /api/admin/distributors/[id]
// Body: { action: 'approve' | 'reject', note?: string }
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!getAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { action, note } = await request.json();
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    const distributors = db.collection('distributors');

    const distributor = await distributors.findOne({ _id: new ObjectId(params.id) });
    if (!distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'active' : 'rejected';

    await distributors.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status: newStatus,
          adminNote: note ?? '',
          reviewedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // When approved, also activate or create the FPS record
    if (action === 'approve') {
      const fps = db.collection('fps');
      const existingFps = await fps.findOne({ distributorId: distributor._id });
      if (existingFps) {
        await fps.updateOne(
          { distributorId: distributor._id },
          { $set: { status: 'active', updatedAt: new Date() } }
        );
      } else {
        await fps.insertOne({
          distributorId: distributor._id,
          name: distributor.shopName || `${distributor.ownerName}'s FPS`,
          shopkeeper: distributor.ownerName,
          hours: '9 AM - 6 PM',
          address: distributor.address || '',
          lat: 12.9716,
          lng: 77.5946,
          stockStatus: 'Available',
          status: 'active',
          createdAt: new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Distributor ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
    });
  } catch (err) {
    console.error('[admin/distributors/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
