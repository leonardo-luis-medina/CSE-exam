import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const exams = await prisma.exam.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      presets: {
        where: { hidden: false },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: { id: true, name: true },
      },
    },
  });
  return NextResponse.json(exams);
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const { name, description, imageUrl, config } = body;

  if (!name || !description || !config) {
    return NextResponse.json({ error: "Name, description, and config are required" }, { status: 400 });
  }

  const count = await prisma.exam.count();

  const exam = await prisma.exam.create({
    data: {
      name,
      description,
      imageUrl: imageUrl || null,
      config: JSON.stringify(config),
      order: count,
    },
  });

  return NextResponse.json(exam);
}