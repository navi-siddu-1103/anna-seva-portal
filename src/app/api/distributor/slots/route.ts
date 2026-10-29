import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// Define available time slots
const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
];

const SLOT_CAPACITY = 20;

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

    // Get date from query params
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Parse the date
    const selectedDate = new Date(dateStr);
    const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);

    const { client } = await connectToDatabase();
    const db = client.db();

    // Resolve distributor _id from the logged-in user's userId
    const distributors = db.collection('distributors');
    const distributor = await distributors.findOne({ userId: new ObjectId(decoded.userId) });

    if (!distributor) {
      return NextResponse.json({ error: 'Distributor profile not found' }, { status: 404 });
    }

    const tokens = db.collection('tokens');

    // Get all tokens for this date and distributor
    const tokensForDate = await tokens
      .find({
        distributorId: distributor._id,
        collectionDate: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      })
      .toArray();

    // Initialize slot data with 0 bookings
    const slotData: { [key: string]: number } = {};
    TIME_SLOTS.forEach(slot => {
      slotData[slot] = 0;
    });

    // Count bookings per time slot
    tokensForDate.forEach((tok) => {
      const slot = tok.timeSlot;
      if (slot && slotData[slot] !== undefined) {
        slotData[slot] += 1;
      } else {
        // Fallback: tokens without a timeSlot go to the first slot
        slotData[TIME_SLOTS[0]] += 1;
      }
    });

    // Format response
    const slotsWithCapacity = TIME_SLOTS.map(slot => ({
      timeSlot: slot,
      booked: slotData[slot],
      capacity: SLOT_CAPACITY,
      available: SLOT_CAPACITY - slotData[slot]
    }));

    return NextResponse.json({
      success: true,
      date: selectedDate.toISOString().split('T')[0],
      slots: slotsWithCapacity,
      totalSlots: TIME_SLOTS.length
    });
  } catch (err) {
    console.error('Get slots error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
