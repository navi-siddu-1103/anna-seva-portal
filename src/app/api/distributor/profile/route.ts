import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// Simple geocoding mock - in production, this should use a real geocoding service
function getCoordinatesFromAddress(address: string): { lat: number; lng: number } {
  // For now, return default coordinates for Bangalore
  // In a real implementation, you would call a geocoding API like Google Maps
  return { lat: 12.9716, lng: 77.5946 };
}

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
    const fps = db.collection('fps');

    const updateDoc: any = {
      updatedAt: new Date()
    };

    if (ownerName) updateDoc.ownerName = ownerName;
    if (shopName) updateDoc.shopName = shopName;
    if (phone) updateDoc.phone = phone;
    if (address) updateDoc.address = address;
    if (licenseNumber) updateDoc.licenseNumber = licenseNumber;

    const distributorId = new ObjectId(decoded.userId);
    
    await distributors.updateOne(
      { userId: distributorId },
      { $set: updateDoc }
    );

    // Also update FPS record if address or shop name changed
    const fpsUpdateDoc: any = {
      updatedAt: new Date()
    };

    if (shopName) fpsUpdateDoc.name = shopName;
    if (ownerName) fpsUpdateDoc.shopkeeper = ownerName;
    if (address) {
      fpsUpdateDoc.address = address;
      const { lat, lng } = getCoordinatesFromAddress(address);
      fpsUpdateDoc.lat = lat;
      fpsUpdateDoc.lng = lng;
    }

    // Update FPS record - using explicit field reference instead of shorthand
    const fpsUpdateResult = await fps.updateOne(
      { distributorId: distributorId },
      { $set: fpsUpdateDoc }
    );

    // If FPS record was not found, create it (fallback for migration cases)
    if (fpsUpdateResult.matchedCount === 0) {
      const { lat, lng } = getCoordinatesFromAddress(address || '');
      const fpsDoc = {
        distributorId: distributorId,
        name: shopName || '',
        shopkeeper: ownerName || '',
        hours: '9 AM - 6 PM',
        address: address || '',
        lat,
        lng,
        stockStatus: 'Available',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      try {
        await fps.insertOne(fpsDoc);
      } catch (insertErr: any) {
        // If insert fails due to duplicate, it's okay - just log it
        if (insertErr.code !== 11000) {
          throw insertErr;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
  } catch (err) {
    console.error('Update distributor profile error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
