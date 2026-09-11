import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const years = await prisma.year.findMany({ orderBy: { year: "desc" } });
  return NextResponse.json(years);
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { year } = await req.json();
  const parsedYear = parseInt(year);
  if (!parsedYear || isNaN(parsedYear)) {
    return NextResponse.json({ error: "Valid year is required" }, { status: 400 });
  }
  const created = await prisma.year.create({ data: { year: parsedYear } });
  return NextResponse.json(created);
}