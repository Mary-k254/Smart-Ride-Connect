import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter (for MVP)
// In production, use Redis-based rate limiting with @upstash/ratelimit
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT = parseInt(process.env.API_RATE_LIMIT || "100", 10);
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Simple in-memory rate limiter for API routes
 * Limits requests to RATE_LIMIT per minute per IP
 */
export function checkRateLimit(request: NextRequest): RateLimitResult {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || request.headers.get("x-real-ip") 
    || "unknown";
  
  const now = Date.now();
  const key = ip;
  
  let record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    record = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
    rateLimitMap.set(key, record);
  }
  
  record.count++;
  
  const remaining = Math.max(0, RATE_LIMIT - record.count);
  
  return {
    success: record.count <= RATE_LIMIT,
    remaining,
    resetTime: record.resetTime,
  };
}

/**
 * Middleware function to apply rate limiting to API routes
 * Returns NextResponse with rate limit headers if exceeded
 */
export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const result = checkRateLimit(request);
  
  if (!result.success) {
    const response = NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
    
    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", RATE_LIMIT.toString());
    response.headers.set("X-RateLimit-Remaining", "0");
    response.headers.set("X-RateLimit-Reset", result.resetTime.toString());
    response.headers.set("Retry-After", Math.ceil((result.resetTime - Date.now()) / 1000).toString());
    
    return response;
  }
  
  return null;
}

/**
 * Apply rate limit headers to successful responses
 */
export function addRateLimitHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const result = checkRateLimit(request);
  
  response.headers.set("X-RateLimit-Limit", RATE_LIMIT.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.resetTime.toString());
  
  return response;
}
