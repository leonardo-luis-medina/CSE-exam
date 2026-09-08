import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id: parseInt(id) },
    include: { category: true, year: true, choices: true },
  });
  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(question);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.question.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}