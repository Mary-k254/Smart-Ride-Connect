import { NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { routes, vehicles, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

initializeDatabase();

export async function GET() {
  try {
    const allRoutes = await db
      .select()
      .from(routes)
      .where(eq(routes.isActive, 1));

    // Get vehicle counts per route
    const routesWithVehicles = await Promise.all(
      allRoutes.map(async (route) => {
        const vehicleList = await db
          .select({
            id: vehicles.id,
            plateNumber: vehicles.plateNumber,
            model: vehicles.model,
            capacity: vehicles.capacity,
            status: vehicles.status,
            currentLat: vehicles.currentLat,
            currentLng: vehicles.currentLng,
            driverName: users.name,
          })
          .from(vehicles)
          .leftJoin(users, eq(vehicles.driverId, users.id))
          .where(eq(vehicles.routeId, route.id));

        return {
          ...route,
          vehicles: vehicleList,
          activeVehicles: vehicleList.filter((v) => v.status === "en_route" || v.status === "active").length,
        };
      })
    );

    return NextResponse.json({ routes: routesWithVehicles });
  } catch (error) {
    console.error("Get routes error:", error);
    return NextResponse.json({ error: "Failed to get routes" }, { status: 500 });
  }
}
