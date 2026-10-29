import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { sendDistributionConfirmationEmail, sendDistributionConfirmationSMS } from '@/lib/notifications';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    // Get token from cookies
    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'distributor') {
      return NextResponse.json({ error: 'Only distributors can mark distributions' }, { status: 403 });
    }

    const body = await request.json();
    const { tokenNumber } = body;

    if (!tokenNumber) {
      return NextResponse.json({ error: 'Token number is required' }, { status: 400 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    
    // Get distributor details
    const distributors = db.collection('distributors');
    const distributor = await distributors.findOne({ userId: new ObjectId(decoded.userId) });
    
    if (!distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Find the token
    const tokens = db.collection('tokens');
    const tokenDoc = await tokens.findOne({ tokenNumber });
    
    if (!tokenDoc) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    // Verify this token belongs to this distributor
    if (tokenDoc.distributorId.toString() !== distributor._id.toString()) {
      return NextResponse.json({ error: 'This token is not assigned to your shop' }, { status: 403 });
    }

    // Check if already distributed
    if (tokenDoc.status === 'collected') {
      return NextResponse.json({ error: 'This token has already been collected' }, { status: 400 });
    }

    if (tokenDoc.status === 'cancelled') {
      return NextResponse.json({ error: 'This token has been cancelled' }, { status: 400 });
    }

    // Update token status to collected
    await tokens.updateOne(
      { tokenNumber },
      {
        $set: {
          status: 'collected',
          distributionDate: new Date(),
          distributedBy: distributor.ownerName,
          updatedAt: new Date(),
        },
      }
    );

    // Update distributor's total orders
    await distributors.updateOne(
      { _id: distributor._id },
      { $inc: { totalOrders: 1 } }
    );

    // Create distribution record
    const distributions = db.collection('distributions');
    const distributionDoc = {
      tokenNumber,
      cardholderId: tokenDoc.cardholderId,
      cardholderName: tokenDoc.cardholderName,
      cardholderEmail: tokenDoc.cardholderEmail,
      cardholderPhone: tokenDoc.cardholderPhone,
      distributorId: distributor._id,
      distributorName: distributor.shopName,
      items: tokenDoc.items,
      distributionDate: new Date(),
      createdAt: new Date(),
    };
    
    await distributions.insertOne(distributionDoc);

    // Send notifications to cardholder
    try {
      const emailItems = tokenDoc.items.map((item: any) => ({
        name: item.productName,
        quantity: item.quantity,
      }));

      await sendDistributionConfirmationEmail(
        tokenDoc.cardholderEmail,
        tokenDoc.cardholderName,
        {
          tokenNumber,
          distributionDate: new Date().toLocaleDateString('en-IN'),
          items: emailItems,
          shopName: distributor.shopName,
        }
      );

      if (tokenDoc.cardholderPhone) {
        const itemsSummary = tokenDoc.items
          .map((item: any) => `${item.productName} ${item.quantity}kg`)
          .join(', ');
        
        await sendDistributionConfirmationSMS(
          tokenDoc.cardholderPhone,
          tokenDoc.cardholderName,
          tokenNumber,
          itemsSummary
        );
      }
    } catch (notificationError) {
      console.error('Failed to send distribution notifications:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Distribution marked successfully. Cardholder has been notified.',
      distributionDate: new Date(),
    });
  } catch (err) {
    console.error('Distribution marking error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Get all distributions for the logged-in distributor
export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'distributor') {
      return NextResponse.json({ error: 'Only distributors can view distributions' }, { status: 403 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    
    const distributors = db.collection('distributors');
    const distributor = await distributors.findOne({ userId: new ObjectId(decoded.userId) });
    
    if (!distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    const distributions = db.collection('distributions');
    const allDistributions = await distributions
      .find({ distributorId: distributor._id })
      .sort({ distributionDate: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      distributions: allDistributions,
      totalDistributions: allDistributions.length,
    });
  } catch (err) {
    console.error('Get distributions error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
