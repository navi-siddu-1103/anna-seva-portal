import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { createToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { accessToken, role } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Google access token is required' }, { status: 400 });
    }

    // Verify the access token by calling Google's userinfo endpoint
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!googleRes.ok) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const googleUser = await googleRes.json();
    const { email, name, picture, id: googleId } = googleUser;

    if (!email) {
      return NextResponse.json({ error: 'Could not retrieve email from Google' }, { status: 400 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    const users = db.collection('users');

    // Check if user already exists (by email OR by googleId)
    let user = await users.findOne({ $or: [{ email }, { googleId }] });
    const userRole = user?.role || role || 'cardholder';

    if (!user) {
      // New user — create account (no password needed for Google auth)
      const newUser = {
        name,
        email,
        googleId,
        picture,
        role: userRole,
        authProvider: 'google',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await users.insertOne(newUser);

      // Create role-specific records for new Google users
      if (userRole === 'cardholder') {
        const cardholders = db.collection('cardholders');
        await cardholders.insertOne({
          userId: result.insertedId,
          name,
          email,
          cardNumber: '',
          phone: '',
          createdAt: new Date(),
          status: 'active',
          entitlements: { rice: 5, wheat: 5, sugar: 2 },
        });
      }

      if (userRole === 'distributor') {
        const distributors = db.collection('distributors');
        await distributors.insertOne({
          userId: result.insertedId,
          ownerName: name,
          email,
          shopName: '',
          licenseNumber: '',
          phone: '',
          address: '',
          createdAt: new Date(),
          status: 'active',
          rating: 0,
          totalOrders: 0,
        });
      }

      user = { ...newUser, _id: result.insertedId };
    } else {
      // Existing user — update Google info and picture
      await users.updateOne(
        { _id: user._id },
        { $set: { googleId, picture, updatedAt: new Date() } }
      );
    }

    // Create JWT session cookie (same as normal login)
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      role: userRole,
    });

    const res = NextResponse.json({
      ok: true,
      role: userRole,
      name: user.name,
      isNewUser: !user.createdAt || new Date(user.createdAt).getTime() > Date.now() - 5000,
    });

    res.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err) {
    console.error('[google-auth]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
