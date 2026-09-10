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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { text, categoryId, yearId, choices } = body;

  if (!text || !categoryId || !Array.isArray(choices) || choices.length !== 4) {
    return NextResponse.json({ error: "Invalid question data" }, { status: 400 });
  }

  const correctCount = choices.filter((c: { isCorrect: boolean }) => c.isCorrect).length;
  if (correctCount !== 1) {
    return NextResponse.json({ error: "Exactly one choice must be marked correct" }, { status: 400 });
  }

  const questionId = parseInt(id);

  // Delete old choices and recreate them (simplest reliable approach for a fixed 4-choice question)
  await prisma.choice.deleteMany({ where: { questionId } });

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: {
      text,
      categoryId: parseInt(categoryId),
      ...(yearId ? { yearId: parseInt(yearId) } : { yearId: null }),
      choices: {
        create: choices.map((c: { text: string; isCorrect: boolean }) => ({
          text: c.text,
          isCorrect: c.isCorrect,
        })),
      },
    },
    include: { choices: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.question.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}