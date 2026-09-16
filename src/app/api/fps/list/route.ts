import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { client } = await connectToDatabase();
    const db = client.db();
    const fps = db.collection('fps');

    // Fetch all active FPS shops, sorted by creation date (newest first)
    const fpsList = await fps
      .find({})
      .project({ distributorId: 0 }) // Exclude internal IDs
      .sort({ createdAt: -1 })
      .toArray();

    // Transform data to match FPS type used by frontend
    const transformedList = fpsList.map((shop: any) => ({
      id: shop._id.toString(),
      name: shop.name,
      shopkeeper: shop.shopkeeper,
      hours: shop.hours,
      stockStatus: shop.stockStatus,
      lat: shop.lat,
      lng: shop.lng,
      address: shop.address
    }));

    return NextResponse.json({ 
      success: true, 
      data: transformedList,
      count: transformedList.length
    });
  } catch (err) {
    console.error('Get FPS list error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
