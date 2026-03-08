import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/auth";
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
    const { identifier, password } = body; // identifier = email or phone

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/phone and password are required" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.phone, identifier)))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated. Contact support." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await generateToken({
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      role: user.role as "passenger" | "driver" | "manager",
      name: user.name,
    });

    const cookieOptions = setAuthCookie(token);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });

    response.cookies.set(cookieOptions);
    return addRateLimitHeaders(response, request);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
