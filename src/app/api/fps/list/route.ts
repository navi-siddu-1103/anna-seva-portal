import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { client } = await connectToDatabase();
    const db = client.db();

    // Get active distributor IDs first
    const activeDistributors = await db.collection('distributors')
      .find({ status: 'active' })
      .project({ _id: 1 })
      .toArray();
    const activeIds = activeDistributors.map(d => d._id);

    // Fetch FPS shops only for active distributors
    const fpsList = await db.collection('fps')
      .find({ distributorId: { $in: activeIds } })
      .project({ distributorId: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    const transformedList = fpsList.map((shop: any) => ({
      id: shop._id.toString(),
      name: shop.name,
      shopkeeper: shop.shopkeeper,
      hours: shop.hours,
      stockStatus: shop.stockStatus,
      lat: shop.lat,
      lng: shop.lng,
      address: shop.address,
    }));

    return NextResponse.json({
      success: true,
      data: transformedList,
      count: transformedList.length,
    });
  } catch (err) {
    console.error('Get FPS list error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
