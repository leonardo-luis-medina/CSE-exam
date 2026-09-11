import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

// Public - needed so the quiz page can load a specific exam's config
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const exam = await prisma.exam.findUnique({ where: { id: parseInt(id) } });
  if (!exam) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(exam);
}

// Admin only - edit exam card details/config
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();
  const { name, description, imageUrl, config } = body;

  if (!name || !description || !config) {
    return NextResponse.json({ error: "Name, description, and config are required" }, { status: 400 });
  }

  const exam = await prisma.exam.update({
    where: { id: parseInt(id) },
    data: {
      name,
      description,
      imageUrl: imageUrl || null,
      config: JSON.stringify(config),
    },
  });

  return NextResponse.json(exam);
}

// Admin only - delete an exam card
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await prisma.exam.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}