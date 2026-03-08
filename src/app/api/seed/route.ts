import { NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { users, vehicles, saccos } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

initializeDatabase();

export async function POST() {
  try {
    // Check if demo accounts already exist
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "passenger@demo.com"))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ message: "Demo accounts already exist" });
    }

    const hashedPassword = await hashPassword("demo123");

    // Create demo users
    const [passenger] = await db
      .insert(users)
      .values({
        name: "Jane Wanjiku",
        email: "passenger@demo.com",
        phone: "+254700000010",
        password: hashedPassword,
        role: "passenger",
      })
      .returning();

    const [driver] = await db
      .insert(users)
      .values({
        name: "John Kamau",
        email: "driver@demo.com",
        phone: "+254700000011",
        password: hashedPassword,
        role: "driver",
      })
      .returning();

    const [manager] = await db
      .insert(users)
      .values({
        name: "Peter Ochieng",
        email: "manager@demo.com",
        phone: "+254700000012",
        password: hashedPassword,
        role: "manager",
      })
      .returning();

    // Get first SACCO
    const [sacco] = await db.select().from(saccos).limit(1);

    // Update SACCO manager
    if (sacco) {
      await db
        .update(saccos)
        .set({ managerId: manager.id })
        .where(eq(saccos.id, sacco.id));
    }

    // Create demo vehicles
    await db.insert(vehicles).values([
      {
        plateNumber: "KCA 123A",
        model: "Toyota Hiace",
        capacity: 14,
        saccoId: sacco?.id || null,
        driverId: driver.id,
        routeId: 1,
        currentLat: -1.2921,
        currentLng: 36.8219,
        status: "en_route",
        isGpsActive: 1,
        lastLocationUpdate: new Date().toISOString(),
      },
      {
        plateNumber: "KCB 456B",
        model: "Isuzu NQR",
        capacity: 33,
        saccoId: sacco?.id || null,
        routeId: 2,
        currentLat: -0.5,
        currentLng: 36.5,
        status: "active",
        isGpsActive: 0,
      },
      {
        plateNumber: "KCC 789C",
        model: "Toyota Coaster",
        capacity: 29,
        saccoId: sacco?.id || null,
        routeId: 3,
        status: "inactive",
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Demo accounts created successfully",
      accounts: {
        passenger: { email: "passenger@demo.com", password: "demo123" },
        driver: { email: "driver@demo.com", password: "demo123" },
        manager: { email: "manager@demo.com", password: "demo123" },
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
  }
}
