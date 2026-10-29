import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { sendDistributionCycleAnnouncementEmail, sendDistributionCycleAnnouncementSMS } from '@/lib/notifications';

export async function POST(request: Request) {
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

    const body = await request.json();
    const { cycleStartDate, description } = body;

    if (!cycleStartDate) {
      return NextResponse.json({ error: 'Cycle start date is required' }, { status: 400 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    const distributors = db.collection('distributors');
    const distributionCycles = db.collection('distributionCycles');
    const cardholders = db.collection('cardholders');

    // Get distributor info
    const distributor = await distributors.findOne({ userId: new ObjectId(decoded.userId) });
    
    if (!distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Create distribution cycle record
    const cycleRecord = {
      distributorId: new ObjectId(decoded.userId),
      distributorName: distributor.shopName,
      ownerName: distributor.ownerName,
      cycleStartDate: new Date(cycleStartDate),
      announcementDate: new Date(),
      description: description || null,
      status: 'announced',
      notificationsSent: false,
      createdAt: new Date(),
    };

    const cycleResult = await distributionCycles.insertOne(cycleRecord);

    // Get all cardholders to send notifications
    const allCardholders = await cardholders.find({}).toArray();

    // Send notifications to all cardholders
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const cycleStartDateFormatted = formatDate(new Date(cycleStartDate));
    const notificationErrors: string[] = [];

    for (const cardholder of allCardholders) {
      try {
        // Send email
        await sendDistributionCycleAnnouncementEmail(
          cardholder.email,
          cardholder.name,
          {
            distributorName: distributor.shopName,
            cycleStartDate: cycleStartDateFormatted,
            description: description
          }
        );

        // Send SMS if phone is available
        if (cardholder.phone) {
          await sendDistributionCycleAnnouncementSMS(
            cardholder.phone,
            cardholder.name,
            distributor.shopName,
            cycleStartDateFormatted
          );
        }
      } catch (notificationError) {
        console.error(`Error sending notification to cardholder ${cardholder._id}:`, notificationError);
        notificationErrors.push(`Failed to notify ${cardholder.email}`);
      }
    }

    // Update notification status
    await distributionCycles.updateOne(
      { _id: cycleResult.insertedId },
      { $set: { notificationsSent: true, updatedAt: new Date() } }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Distribution cycle announced successfully',
      cycleId: cycleResult.insertedId,
      notificationsSent: allCardholders.length,
      notificationErrors: notificationErrors.length > 0 ? notificationErrors : null
    });
  } catch (err) {
    console.error('Announce distribution cycle error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Get token from cookies
    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    const distributionCycles = db.collection('distributionCycles');

    let query: any = {};
    
    // Distributors see only their own cycles
    if (decoded.role === 'distributor') {
      query.distributorId = new ObjectId(decoded.userId);
    }

    const cycles = await distributionCycles
      .find(query)
      .sort({ announcementDate: -1 })
      .toArray();

    return NextResponse.json({ 
      success: true, 
      data: cycles
    });
  } catch (err) {
    console.error('Get distribution cycles error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
