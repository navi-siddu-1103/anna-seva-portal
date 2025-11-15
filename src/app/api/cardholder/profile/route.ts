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
    if (!decoded || decoded.role !== 'cardholder') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    const cardholders = db.collection('cardholders');

    const cardholder = await cardholders.findOne({ userId: new ObjectId(decoded.userId) });
    
    if (!cardholder) {
      return NextResponse.json({ error: 'Cardholder not found' }, { status: 404 });
    }

    // Remove sensitive fields
    const { _id, ...cardholderData } = cardholder;

    return NextResponse.json({ 
      success: true, 
      data: cardholderData 
    });
  } catch (err) {
    console.error('Get cardholder profile error:', err);
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
    if (!decoded || decoded.role !== 'cardholder') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, cardNumber } = body;

    const { client } = await connectToDatabase();
    const db = client.db();
    const cardholders = db.collection('cardholders');

    const updateDoc: any = {
      updatedAt: new Date()
    };

    if (name) updateDoc.name = name;
    if (phone) updateDoc.phone = phone;
    if (cardNumber) updateDoc.cardNumber = cardNumber;

    await cardholders.updateOne(
      { userId: new ObjectId(decoded.userId) },
      { $set: updateDoc }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
  } catch (err) {
    console.error('Update cardholder profile error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
