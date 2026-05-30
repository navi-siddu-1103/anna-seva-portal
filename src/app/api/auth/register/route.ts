import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword, createToken } from '@/lib/auth';
import { sendWelcomeEmail, sendWelcomeSMS } from '@/lib/notifications';

// Simple geocoding mock - in production, this should use a real geocoding service
function getCoordinatesFromAddress(address: string): { lat: number; lng: number } {
  // For now, return default coordinates for Bangalore
  // In a real implementation, you would call a geocoding API like Google Maps
  return { lat: 12.9716, lng: 77.5946 };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, cardNumber, phone, shopName, licenseNumber, address } = body;
    
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    const users = db.collection('users');

    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    
    // Build base user document
    const userDoc: any = {
      name,
      email,
      password: hashed,
      role: role || 'cardholder',
      createdAt: new Date()
    };

    // Insert user into users collection
    const result = await users.insertOne(userDoc);
    const userId = result.insertedId.toString();

    // Store role-specific details in separate collections
    if (role === 'cardholder') {
      const cardholders = db.collection('cardholders');
      const cardholderDoc = {
        userId: result.insertedId,
        name,
        email,
        cardNumber: cardNumber || '',
        phone: phone || '',
        createdAt: new Date(),
        status: 'active',
        entitlements: {
          rice: 5,
          wheat: 5,
          sugar: 2
        }
      };
      await cardholders.insertOne(cardholderDoc);
    }

    if (role === 'distributor') {
      const distributors = db.collection('distributors');
      const distributorDoc = {
        userId: result.insertedId,
        ownerName: name,
        email,
        shopName: shopName || '',
        licenseNumber: licenseNumber || '',
        phone: phone || '',
        address: address || '',
        createdAt: new Date(),
        status: 'active',
        rating: 0,
        totalOrders: 0
      };
      await distributors.insertOne(distributorDoc);

      // Create FPS record for the distributor
      const fps = db.collection('fps');
      const { lat, lng } = getCoordinatesFromAddress(address || '');
      const fpsDoc = {
        distributorId: result.insertedId,
        name: shopName || '',
        shopkeeper: name,
        hours: '9 AM - 6 PM', // Default hours
        address: address || '',
        lat,
        lng,
        stockStatus: 'Available',
        createdAt: new Date()
      };
      await fps.insertOne(fpsDoc);
    }

    // Send welcome notifications (email and SMS)
    try {
      await sendWelcomeEmail(email, name, role || 'cardholder');
      if (phone) {
        await sendWelcomeSMS(phone, name, role || 'cardholder');
      }
    } catch (notificationError) {
      // Log but don't fail registration if notification fails
      console.error('Failed to send welcome notifications:', notificationError);
    }

    const token = createToken({ userId, email, role: role || 'cardholder' });

    const res = NextResponse.json({ ok: true, role: role || 'cardholder', userId });
    res.cookies.set('token', token, { httpOnly: true, path: '/', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
