import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { questionSchema } from "@/lib/schemas/question";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const questions = await prisma.question.findMany({
    include: { category: true, year: true, choices: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const { text, categoryId, yearId, choices, imageUrl } = body;

  


const parsed = questionSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
}









  const question = await prisma.question.create({
    data: {
      text,
      imageUrl: imageUrl || null,
      category: categoryId ? { connect: { id: parseInt(categoryId) } } : undefined,
      year: yearId ? { connect: { id: parseInt(yearId) } } : undefined,
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