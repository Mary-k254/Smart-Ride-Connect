import { NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { trafficAlerts, routes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

initializeDatabase();

export async function GET() {
  try {
    const alerts = await db
      .select({
        id: trafficAlerts.id,
        routeId: trafficAlerts.routeId,
        title: trafficAlerts.title,
        description: trafficAlerts.description,
        severity: trafficAlerts.severity,
        lat: trafficAlerts.lat,
        lng: trafficAlerts.lng,
        isActive: trafficAlerts.isActive,
        createdAt: trafficAlerts.createdAt,
        routeName: routes.name,
      })
      .from(trafficAlerts)
      .leftJoin(routes, eq(trafficAlerts.routeId, routes.id))
      .where(eq(trafficAlerts.isActive, 1));

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Get traffic alerts error:", error);
    return NextResponse.json({ error: "Failed to get traffic alerts" }, { status: 500 });
  }
}
