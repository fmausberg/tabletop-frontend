import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Validate the token by calling the backend /auth/me endpoint
  try {
    // Forward all cookies from the request to maintain the same cookie context
    const cookieHeader = request.headers.get("cookie") || "";

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
    });

    if (!response.ok) {
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Token is valid, allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    // Network error or other issue, redirect to login
    console.error("Middleware auth validation error:", error);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

// Specify the paths where the middleware should run
export const config = {
  matcher: ["/home/:path+", "/admin/:path+"], // Apply middleware to all routes under /home and /admin
};
