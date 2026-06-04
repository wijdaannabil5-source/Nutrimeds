import { NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

export async function proxy(request) {
  // Prevent infinite loops when betterFetch calls /api/auth/get-session
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 1. Get the current session
  const { data: session } = await betterFetch("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
  
  // Protect all API routes except public ones (like /api/calculate and /api/meal-plan/generate)
  const isProtectedApi = 
    request.nextUrl.pathname.startsWith('/api/children') || 
    request.nextUrl.pathname.startsWith('/api/measurements') || 
    (request.nextUrl.pathname.startsWith('/api/meal-plan') && !request.nextUrl.pathname.startsWith('/api/meal-plan/generate'));

  // 2. Redirect logic
  if (!session) {
    if (isDashboardPage) {
      // Redirect to login if trying to access dashboard without session
      // (For now, redirect to root as there's no dedicated login page yet)
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    if (isAuthPage) {
      // Redirect to dashboard if already logged in and trying to access auth pages
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
