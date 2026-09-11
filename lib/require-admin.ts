import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Call this at the top of any admin-only API route.
 * Returns a 401 response if there's no valid session, otherwise returns null
 * (meaning the caller is authorized and the route handler should proceed).
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}