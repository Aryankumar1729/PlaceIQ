import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/prep", "/tracker", "/resume","/profile"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("placeiq_token")?.value;
  const isProtected = protectedRoutes.some((r) =>
    req.nextUrl.pathname.startsWith(r)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Token exists — let it through
  // Full verification happens in API routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/prep/:path*", "/tracker/:path*", "/resume/:path*", "/profile/:path*"],
};