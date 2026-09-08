import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const questions = await prisma.question.findMany({
    include: { category: true, year: true, choices: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { text, categoryId, yearId, choices } = body;

  if (!text || !categoryId || !Array.isArray(choices) || choices.length !== 4) {
    return NextResponse.json({ error: "Invalid question data" }, { status: 400 });
  }

  const correctCount = choices.filter((c: { isCorrect: boolean }) => c.isCorrect).length;
  if (correctCount !== 1) {
    return NextResponse.json({ error: "Exactly one choice must be marked correct" }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: {
      text,
      categoryId: parseInt(categoryId),
      ...(yearId ? { yearId: parseInt(yearId) } : {}),
      choices: {
        create: choices.map((c: { text: string; isCorrect: boolean }) => ({
          text: c.text,
          isCorrect: c.isCorrect,
        })),
      },
    },
    include: { choices: true },
  });

  return NextResponse.json(question);
}