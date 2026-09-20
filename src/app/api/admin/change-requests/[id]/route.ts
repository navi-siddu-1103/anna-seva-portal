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

// PATCH /api/admin/change-requests/[id]
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
    const changeRequests = db.collection('distributorChangeRequests');

    const changeReq = await changeRequests.findOne({ _id: new ObjectId(params.id) });
    if (!changeReq) {
      return NextResponse.json({ error: 'Change request not found' }, { status: 404 });
    }
    if (changeReq.status !== 'pending') {
      return NextResponse.json({ error: 'This request has already been reviewed' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    await changeRequests.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { status: newStatus, adminNote: note ?? '', reviewedAt: new Date() } }
    );

    if (action === 'approve') {
      const { requestedChanges, distributorId } = changeReq;

      // Apply changes to distributors collection
      const distributorUpdate: any = { updatedAt: new Date() };
      if (requestedChanges.ownerName) distributorUpdate.ownerName = requestedChanges.ownerName;
      if (requestedChanges.shopName)  distributorUpdate.shopName  = requestedChanges.shopName;
      if (requestedChanges.phone)     distributorUpdate.phone     = requestedChanges.phone;
      if (requestedChanges.address)   distributorUpdate.address   = requestedChanges.address;
      if (requestedChanges.licenseNumber) distributorUpdate.licenseNumber = requestedChanges.licenseNumber;

      await db.collection('distributors').updateOne(
        { _id: new ObjectId(distributorId) },
        { $set: distributorUpdate }
      );

      // Apply matching changes to fps collection (name, shopkeeper, address)
      const fpsUpdate: any = { updatedAt: new Date() };
      if (requestedChanges.shopName)  fpsUpdate.name       = requestedChanges.shopName;
      if (requestedChanges.ownerName) fpsUpdate.shopkeeper = requestedChanges.ownerName;
      if (requestedChanges.address)   fpsUpdate.address    = requestedChanges.address;

      if (Object.keys(fpsUpdate).length > 1) {
        await db.collection('fps').updateOne(
          { distributorId: new ObjectId(distributorId) },
          { $set: fpsUpdate }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Change request ${action === 'approve' ? 'approved and applied' : 'rejected'}.`,
    });
  } catch (err) {
    console.error('[admin/change-requests/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
