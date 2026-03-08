import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { vehicles } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

initializeDatabase();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "driver") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { lat, lng } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    await db
      .update(vehicles)
      .set({
        currentLat: lat,
        currentLng: lng,
        lastLocationUpdate: new Date().toISOString(),
        isGpsActive: 1,
        status: "en_route",
      })
      .where(eq(vehicles.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update location error:", error);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [vehicle] = await db
      .select({
        id: vehicles.id,
        currentLat: vehicles.currentLat,
        currentLng: vehicles.currentLng,
        lastLocationUpdate: vehicles.lastLocationUpdate,
        status: vehicles.status,
        isGpsActive: vehicles.isGpsActive,
      })
      .from(vehicles)
      .where(eq(vehicles.id, parseInt(id)))
      .limit(1);

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ location: vehicle });
  } catch (error) {
    console.error("Get location error:", error);
    return NextResponse.json({ error: "Failed to get location" }, { status: 500 });
  }
}
