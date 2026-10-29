import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

// GET  /api/distributor/tokens?date=YYYY-MM-DD
// Returns all booked tokens for the logged-in distributor on the given date (default: today).
export async function GET(request: Request) {
  try {
    const cookie = request.headers
      .get("cookie")
      ?.split("; ")
      .find((r) => r.startsWith("token="))
      ?.split("=")[1];

    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(cookie);
    if (!decoded || decoded.role !== "distributor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

    const selectedDate = new Date(dateStr);
    const startOfDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    const endOfDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() + 1
    );

    const { client } = await connectToDatabase();
    const db = client.db();

    // Resolve distributor _id from userId
    const distributors = db.collection("distributors");
    const distributor = await distributors.findOne({
      userId: new ObjectId(decoded.userId),
    });

    if (!distributor) {
      return NextResponse.json({ error: "Distributor not found" }, { status: 404 });
    }

    const tokens = db.collection("tokens");
    const bookedTokens = await tokens
      .find({
        distributorId: distributor._id,
        collectionDate: { $gte: startOfDay, $lt: endOfDay },
        status: { $in: ["booked", "collected"] },
      })
      .sort({ collectionDate: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      date: dateStr,
      tokens: bookedTokens,
      totalBooked: bookedTokens.filter((t) => t.status === "booked").length,
      totalCollected: bookedTokens.filter((t) => t.status === "collected").length,
    });
  } catch (err) {
    console.error("Get distributor tokens error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/distributor/tokens
// Body: { tokenNumber: string }
// Marks a token as "collected" — shortcut without full /distribute POST flow.
export async function PATCH(request: Request) {
  try {
    const cookie = request.headers
      .get("cookie")
      ?.split("; ")
      .find((r) => r.startsWith("token="))
      ?.split("=")[1];

    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(cookie);
    if (!decoded || decoded.role !== "distributor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tokenNumber } = body;

    if (!tokenNumber) {
      return NextResponse.json({ error: "tokenNumber is required" }, { status: 400 });
    }

    const { client } = await connectToDatabase();
    const db = client.db();

    const distributors = db.collection("distributors");
    const distributor = await distributors.findOne({
      userId: new ObjectId(decoded.userId),
    });

    if (!distributor) {
      return NextResponse.json({ error: "Distributor not found" }, { status: 404 });
    }

    const tokens = db.collection("tokens");
    const tokenDoc = await tokens.findOne({ tokenNumber });

    if (!tokenDoc) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    if (tokenDoc.distributorId.toString() !== distributor._id.toString()) {
      return NextResponse.json(
        { error: "Token does not belong to your shop" },
        { status: 403 }
      );
    }

    if (tokenDoc.status === "collected") {
      return NextResponse.json({ error: "Token already collected" }, { status: 400 });
    }

    await tokens.updateOne(
      { tokenNumber },
      {
        $set: {
          status: "collected",
          distributionDate: new Date(),
          distributedBy: distributor.ownerName ?? distributor.name,
          updatedAt: new Date(),
        },
      }
    );

    // Also increment distributor total orders
    await distributors.updateOne({ _id: distributor._id }, { $inc: { totalOrders: 1 } });

    return NextResponse.json({ success: true, message: "Token marked as collected" });
  } catch (err) {
    console.error("Mark collected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
