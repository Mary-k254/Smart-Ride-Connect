import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

initializeDatabase();

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, authUser.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    const unreadCount = result.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications: result, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Failed to get notifications" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    if (notificationId) {
      await db
        .update(notifications)
        .set({ isRead: 1 })
        .where(eq(notifications.id, notificationId));
    } else {
      // Mark all as read
      await db
        .update(notifications)
        .set({ isRead: 1 })
        .where(eq(notifications.userId, authUser.userId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
