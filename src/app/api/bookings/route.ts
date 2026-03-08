import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { bookings, routes, vehicles, notifications } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";
import { rateLimitMiddleware, addRateLimitHeaders } from "@/lib/rate-limit";
import { calculateDistance, calculateFare } from "@/lib/utils";
import { eq, desc } from "drizzle-orm";

initializeDatabase();

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = db
      .select({
        id: bookings.id,
        passengerId: bookings.passengerId,
        vehicleId: bookings.vehicleId,
        routeId: bookings.routeId,
        pickupLat: bookings.pickupLat,
        pickupLng: bookings.pickupLng,
        pickupAddress: bookings.pickupAddress,
        dropoffLat: bookings.dropoffLat,
        dropoffLng: bookings.dropoffLng,
        dropoffAddress: bookings.dropoffAddress,
        distanceKm: bookings.distanceKm,
        fareAmount: bookings.fareAmount,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        paymentMethod: bookings.paymentMethod,
        seatNumber: bookings.seatNumber,
        createdAt: bookings.createdAt,
        routeName: routes.name,
        routeOrigin: routes.origin,
        routeDestination: routes.destination,
        vehiclePlate: vehicles.plateNumber,
        vehicleModel: vehicles.model,
      })
      .from(bookings)
      .leftJoin(routes, eq(bookings.routeId, routes.id))
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .orderBy(desc(bookings.createdAt));

    // Filter by user role
    if (authUser.role === "passenger") {
      query = query.where(eq(bookings.passengerId, authUser.userId)) as typeof query;
    }

    if (status) {
      query = query.where(eq(bookings.status, status as "pending" | "confirmed" | "picked_up" | "completed" | "cancelled")) as typeof query;
    }

    const result = await query;
    return addRateLimitHeaders(NextResponse.json({ bookings: result }), request);
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json({ error: "Failed to get bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "passenger") {
      return NextResponse.json({ error: "Only passengers can make bookings" }, { status: 401 });
    }

    const body = await request.json();
    const {
      routeId,
      vehicleId,
      pickupLat,
      pickupLng,
      pickupAddress,
      dropoffLat,
      dropoffLng,
      dropoffAddress,
    } = body;

    if (!routeId || !pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      return NextResponse.json(
        { error: "Route, pickup and dropoff locations are required" },
        { status: 400 }
      );
    }

    // Get route for fare calculation
    const [route] = await db
      .select()
      .from(routes)
      .where(eq(routes.id, routeId))
      .limit(1);

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    const distanceKm = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const fareAmount = calculateFare(distanceKm, route.baseFarePerKm);

    // Get next available seat
    const existingBookings = await db
      .select({ seatNumber: bookings.seatNumber })
      .from(bookings)
      .where(eq(bookings.vehicleId, vehicleId || 0));

    const usedSeats = existingBookings.map((b) => b.seatNumber).filter(Boolean);
    let seatNumber = 1;
    while (usedSeats.includes(seatNumber)) seatNumber++;

    const [newBooking] = await db
      .insert(bookings)
      .values({
        passengerId: authUser.userId,
        vehicleId: vehicleId || null,
        routeId,
        pickupLat,
        pickupLng,
        pickupAddress: pickupAddress || null,
        dropoffLat,
        dropoffLng,
        dropoffAddress: dropoffAddress || null,
        distanceKm,
        fareAmount,
        seatNumber,
        status: "pending",
        paymentStatus: "unpaid",
      })
      .returning();

    // Create notification
    await db.insert(notifications).values({
      userId: authUser.userId,
      title: "Booking Confirmed",
      message: `Your booking on ${route.name} has been created. Fare: KES ${fareAmount}`,
      type: "booking",
    });

    return addRateLimitHeaders(NextResponse.json({ booking: newBooking }, { status: 201 }), request);
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
