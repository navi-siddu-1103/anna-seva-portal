import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    // Get token from cookies
    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'distributor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    const distributors = db.collection('distributors');

    const distributor = await distributors.findOne({ userId: new ObjectId(decoded.userId) });
    
    if (!distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Remove sensitive fields
    const { _id, ...distributorData } = distributor;

    return NextResponse.json({ 
      success: true, 
      data: distributorData 
    });
  } catch (err) {
    console.error('Get distributor profile error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'distributor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ownerName, shopName, phone, address, licenseNumber } = body;

    const { client } = await connectToDatabase();
    const db = client.db();
    const distributors = db.collection('distributors');

    const updateDoc: any = {
      updatedAt: new Date()
    };

    if (ownerName) updateDoc.ownerName = ownerName;
    if (shopName) updateDoc.shopName = shopName;
    if (phone) updateDoc.phone = phone;
    if (address) updateDoc.address = address;
    if (licenseNumber) updateDoc.licenseNumber = licenseNumber;

    await distributors.updateOne(
      { userId: new ObjectId(decoded.userId) },
      { $set: updateDoc }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
  } catch (err) {
    console.error('Update distributor profile error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
