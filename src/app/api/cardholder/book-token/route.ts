import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { sendTokenBookingEmail, sendTokenBookingSMS } from '@/lib/notifications';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    // Get token from cookies
    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'cardholder') {
      return NextResponse.json({ error: 'Only cardholders can book tokens' }, { status: 403 });
    }

    const body = await request.json();
    const { items, distributorId, collectionDate } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    if (!distributorId) {
      return NextResponse.json({ error: 'Distributor/Shop is required' }, { status: 400 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    
    // Get cardholder details
    const cardholders = db.collection('cardholders');
    const cardholder = await cardholders.findOne({ userId: new ObjectId(decoded.userId) });
    
    if (!cardholder) {
      return NextResponse.json({ error: 'Cardholder not found' }, { status: 404 });
    }

    // Get distributor details
    const distributors = db.collection('distributors');
    const distributor = await distributors.findOne({ _id: new ObjectId(distributorId) });
    
    if (!distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Generate token number
    const tokenNumber = `TKN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create token booking document
    const tokens = db.collection('tokens');
    const tokenDoc = {
      tokenNumber,
      cardholderId: cardholder._id,
      cardholderName: cardholder.name,
      cardholderEmail: cardholder.email,
      cardholderPhone: cardholder.phone,
      cardNumber: cardholder.cardNumber,
      distributorId: distributor._id,
      distributorName: distributor.shopName,
      distributorAddress: distributor.address,
      items: items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
      })),
      collectionDate: collectionDate ? new Date(collectionDate) : new Date(),
      bookingDate: new Date(),
      status: 'booked', // booked, collected, cancelled
      createdAt: new Date(),
    };

    await tokens.insertOne(tokenDoc);

    // Send notifications
    try {
      const emailItems = items.map((item: any) => ({
        name: item.productName,
        quantity: item.quantity,
      }));

      await sendTokenBookingEmail(
        cardholder.email,
        cardholder.name,
        {
          tokenNumber,
          bookingDate: new Date().toLocaleDateString('en-IN'),
          items: emailItems,
          shopName: distributor.shopName,
          shopAddress: distributor.address,
        }
      );

      if (cardholder.phone) {
        await sendTokenBookingSMS(
          cardholder.phone,
          cardholder.name,
          tokenNumber,
          distributor.shopName
        );
      }
    } catch (notificationError) {
      console.error('Failed to send token booking notifications:', notificationError);
    }

    return NextResponse.json({
      success: true,
      tokenNumber,
      message: 'Token booked successfully. Notifications sent to your email and phone.',
    });
  } catch (err) {
    console.error('Token booking error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Get all tokens for the logged-in cardholder
export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'cardholder') {
      return NextResponse.json({ error: 'Only cardholders can view tokens' }, { status: 403 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    
    const cardholders = db.collection('cardholders');
    const cardholder = await cardholders.findOne({ userId: new ObjectId(decoded.userId) });
    
    if (!cardholder) {
      return NextResponse.json({ error: 'Cardholder not found' }, { status: 404 });
    }

    const tokens = db.collection('tokens');
    const allTokens = await tokens
      .find({ cardholderId: cardholder._id })
      .sort({ bookingDate: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      tokens: allTokens,
    });
  } catch (err) {
    console.error('Get tokens error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
