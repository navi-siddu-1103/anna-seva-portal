import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'distributor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();

    const distributor = await db.collection('distributors').findOne({ userId: new ObjectId(decoded.userId) });
    if (!distributor) return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });

    // Check for any pending change request
    const pendingRequest = await db.collection('distributorChangeRequests').findOne({
      distributorId: distributor._id.toString(),
      status: 'pending',
    });

    const { _id, ...distributorData } = distributor;

    return NextResponse.json({
      success: true,
      data: distributorData,
      pendingChangeRequest: pendingRequest ?? null,
    });
  } catch (err) {
    console.error('Get distributor profile error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'distributor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ownerName, shopName, phone, address, licenseNumber } = body;

    const { client } = await connectToDatabase();
    const db = client.db();

    const distributor = await db.collection('distributors').findOne({ userId: new ObjectId(decoded.userId) });
    if (!distributor) return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });

    // Check if a pending change request already exists
    const existingPending = await db.collection('distributorChangeRequests').findOne({
      distributorId: distributor._id.toString(),
      status: 'pending',
    });
    if (existingPending) {
      return NextResponse.json(
        { error: 'You already have a pending change request. Please wait for admin review.' },
        { status: 400 }
      );
    }

    // Build the requested changes (only include changed fields)
    const requestedChanges: Record<string, string> = {};
    const currentValues: Record<string, string> = {};

    if (ownerName && ownerName !== distributor.ownerName) {
      requestedChanges.ownerName = ownerName;
      currentValues.ownerName = distributor.ownerName;
    }
    if (shopName && shopName !== distributor.shopName) {
      requestedChanges.shopName = shopName;
      currentValues.shopName = distributor.shopName;
    }
    if (phone && phone !== distributor.phone) {
      requestedChanges.phone = phone;
      currentValues.phone = distributor.phone;
    }
    if (address && address !== distributor.address) {
      requestedChanges.address = address;
      currentValues.address = distributor.address;
    }
    if (licenseNumber && licenseNumber !== distributor.licenseNumber) {
      requestedChanges.licenseNumber = licenseNumber;
      currentValues.licenseNumber = distributor.licenseNumber;
    }

    if (Object.keys(requestedChanges).length === 0) {
      return NextResponse.json({ error: 'No changes detected' }, { status: 400 });
    }

    await db.collection('distributorChangeRequests').insertOne({
      distributorId: distributor._id.toString(),
      distributorName: distributor.ownerName,
      distributorEmail: distributor.email,
      requestedChanges,
      currentValues,
      status: 'pending',
      requestedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Your changes have been submitted for admin review. They will be applied once approved.',
    });
  } catch (err) {
    console.error('Update distributor profile error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
