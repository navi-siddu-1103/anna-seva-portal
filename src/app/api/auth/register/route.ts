import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword, createToken } from '@/lib/auth';

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
