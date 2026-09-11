import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const presets = await prisma.examPreset.findMany({
    where: { examId: parseInt(id) },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(presets);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();
  const { name, config } = body;

  if (!name || !config) {
    return NextResponse.json({ error: "Name and config are required" }, { status: 400 });
  }

  const preset = await prisma.examPreset.create({
    data: {
      examId: parseInt(id),
      name,
      config: JSON.stringify(config),
    },
  });

  return NextResponse.json(preset);
}