import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isOnLoginPage = request.nextUrl.pathname === "/admin/login";

  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.includes("session-token"));

  if (!isOnLoginPage && !hasSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};