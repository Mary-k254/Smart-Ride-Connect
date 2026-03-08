import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { vehicles, users, routes, saccos } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";
import { rateLimitMiddleware, addRateLimitHeaders } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";

initializeDatabase();

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get("routeId");

    let query = db
      .select({
        id: vehicles.id,
        plateNumber: vehicles.plateNumber,
        model: vehicles.model,
        capacity: vehicles.capacity,
        status: vehicles.status,
        currentLat: vehicles.currentLat,
        currentLng: vehicles.currentLng,
        lastLocationUpdate: vehicles.lastLocationUpdate,
        isGpsActive: vehicles.isGpsActive,
        routeId: vehicles.routeId,
        driverId: vehicles.driverId,
        driverName: users.name,
        driverPhone: users.phone,
        routeName: routes.name,
        routeOrigin: routes.origin,
        routeDestination: routes.destination,
        saccoName: saccos.name,
      })
      .from(vehicles)
      .leftJoin(users, eq(vehicles.driverId, users.id))
      .leftJoin(routes, eq(vehicles.routeId, routes.id))
      .leftJoin(saccos, eq(vehicles.saccoId, saccos.id));

    const result = routeId
      ? await query.where(eq(vehicles.routeId, parseInt(routeId)))
      : await query;

    return addRateLimitHeaders(NextResponse.json({ vehicles: result }), request);
  } catch (error) {
    console.error("Get vehicles error:", error);
    return NextResponse.json({ error: "Failed to get vehicles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plateNumber, model, capacity, saccoId, driverId, routeId } = body;

    if (!plateNumber || !model) {
      return NextResponse.json(
        { error: "Plate number and model are required" },
        { status: 400 }
      );
    }

    const [newVehicle] = await db
      .insert(vehicles)
      .values({
        plateNumber,
        model,
        capacity: capacity || 14,
        saccoId: saccoId || null,
        driverId: driverId || null,
        routeId: routeId || null,
      })
      .returning();

    return NextResponse.json({ vehicle: newVehicle }, { status: 201 });
  } catch (error) {
    console.error("Create vehicle error:", error);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
