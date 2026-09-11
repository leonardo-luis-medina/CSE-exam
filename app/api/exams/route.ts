import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

// Public - anyone can view the list of exams (for the homepage marketplace)
export async function GET() {
  const exams = await prisma.exam.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(exams);
}

// Admin only - create a new exam card
export async function POST(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const { name, description, imageUrl, config } = body;

  if (!name || !description || !config) {
    return NextResponse.json({ error: "Name, description, and config are required" }, { status: 400 });
  }

  const exam = await prisma.exam.create({
    data: {
      name,
      description,
      imageUrl: imageUrl || null,
      config: JSON.stringify(config),
    },
  });

  return NextResponse.json(exam);
}