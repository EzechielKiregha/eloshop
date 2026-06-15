import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Public routes — always accessible
  if (
    pathname === "/" ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Public API routes (products GET, categories GET)
  if (pathname.startsWith("/api/products") && req.method === "GET") return NextResponse.next();
  if (pathname.startsWith("/api/categories") && req.method === "GET") return NextResponse.next();

  // Checkout is allowed for everyone (guest checkout)
  if (pathname === "/checkout") return NextResponse.next();
  if (pathname === "/api/orders" && req.method === "POST") return NextResponse.next();

  // Protected routes — require login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes — require ADMIN role
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/sales") || pathname.startsWith("/api/dashboard") || pathname.startsWith("/api/inventory")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};
