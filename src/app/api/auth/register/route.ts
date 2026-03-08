import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";
import { rateLimitMiddleware, addRateLimitHeaders } from "@/lib/rate-limit";
import { eq, or } from "drizzle-orm";

initializeDatabase();

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  try {
    const body = await request.json();
    const { name, email, phone, password, role } = body;

    if (!name || !password || (!email && !phone)) {
      return NextResponse.json(
        { error: "Name, password, and email or phone are required" },
        { status: 400 }
      );
    }

    if (!["passenger", "driver", "manager"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const conditions = [];
    if (email) conditions.push(eq(users.email, email));
    if (phone) conditions.push(eq(users.phone, phone));

    const existingUser = await db
      .select()
      .from(users)
      .where(or(...conditions))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        role,
      })
      .returning();

    const token = await generateToken({
      userId: newUser.id,
      email: newUser.email || undefined,
      phone: newUser.phone || undefined,
      role: newUser.role as "passenger" | "driver" | "manager",
      name: newUser.name,
    });

    const cookieOptions = setAuthCookie(token);
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
      token,
    });

    response.cookies.set(cookieOptions);
    return addRateLimitHeaders(response, request);
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
