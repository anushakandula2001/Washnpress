import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "wnp_session";

const PROTECTED_PREFIXES = ["/resident", "/operations", "/admin", "/onboarding"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname === "/operations") {
    return NextResponse.redirect(new URL("/operations/dashboard", request.url));
  }
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  if (pathname === "/resident") {
    return NextResponse.redirect(new URL("/resident/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/resident",
    "/resident/:path*",
    "/operations",
    "/operations/:path*",
    "/admin",
    "/admin/:path*",
    "/onboarding",
  ],
};
