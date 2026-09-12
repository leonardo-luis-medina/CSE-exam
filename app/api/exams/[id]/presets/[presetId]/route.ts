import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; presetId: string }> }
) {
  const { presetId } = await params;
  const preset = await prisma.examPreset.findUnique({ where: { id: parseInt(presetId) } });
  if (!preset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(preset);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; presetId: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { presetId } = await params;
  const body = await req.json();
  const { name, config, hidden } = body;

  // Toggle-only request (just flipping hidden, e.g. from the list page)
  if (hidden !== undefined && name === undefined && config === undefined) {
    const preset = await prisma.examPreset.update({
      where: { id: parseInt(presetId) },
      data: { hidden },
    });
    return NextResponse.json(preset);
  }

  if (!name || !config) {
    return NextResponse.json({ error: "Name and config are required" }, { status: 400 });
  }

  const preset = await prisma.examPreset.update({
    where: { id: parseInt(presetId) },
    data: {
      name,
      config: JSON.stringify(config),
      ...(hidden !== undefined ? { hidden } : {}),
    },
  });

  return NextResponse.json(preset);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; presetId: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { presetId } = await params;
  await prisma.examPreset.delete({ where: { id: parseInt(presetId) } });
  return NextResponse.json({ success: true });
}