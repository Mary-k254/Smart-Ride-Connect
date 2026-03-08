import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { trips, vehicles, routes, users } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

initializeDatabase();

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get("driverId");

    let query = db
      .select({
        id: trips.id,
        driverId: trips.driverId,
        vehicleId: trips.vehicleId,
        routeId: trips.routeId,
        startTime: trips.startTime,
        endTime: trips.endTime,
        distanceKm: trips.distanceKm,
        passengersCount: trips.passengersCount,
        totalRevenue: trips.totalRevenue,
        status: trips.status,
        createdAt: trips.createdAt,
        driverName: users.name,
        vehiclePlate: vehicles.plateNumber,
        routeName: routes.name,
      })
      .from(trips)
      .leftJoin(users, eq(trips.driverId, users.id))
      .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .leftJoin(routes, eq(trips.routeId, routes.id))
      .orderBy(desc(trips.createdAt));

    if (authUser.role === "driver") {
      query = query.where(eq(trips.driverId, authUser.userId)) as typeof query;
    } else if (driverId) {
      query = query.where(eq(trips.driverId, parseInt(driverId))) as typeof query;
    }

    const result = await query;
    return NextResponse.json({ trips: result });
  } catch (error) {
    console.error("Get trips error:", error);
    return NextResponse.json({ error: "Failed to get trips" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "driver") {
      return NextResponse.json({ error: "Only drivers can start trips" }, { status: 401 });
    }

    const body = await request.json();
    const { vehicleId, routeId } = body;

    if (!vehicleId || !routeId) {
      return NextResponse.json(
        { error: "Vehicle and route are required" },
        { status: 400 }
      );
    }

    const [newTrip] = await db
      .insert(trips)
      .values({
        driverId: authUser.userId,
        vehicleId,
        routeId,
        startTime: new Date().toISOString(),
        status: "ongoing",
      })
      .returning();

    // Update vehicle status
    await db
      .update(vehicles)
      .set({ status: "en_route" })
      .where(eq(vehicles.id, vehicleId));

    return NextResponse.json({ trip: newTrip }, { status: 201 });
  } catch (error) {
    console.error("Create trip error:", error);
    return NextResponse.json({ error: "Failed to start trip" }, { status: 500 });
  }
}
