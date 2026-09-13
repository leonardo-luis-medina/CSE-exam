import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { questionSchema } from "@/lib/schemas/question";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

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
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();
  const { text, categoryId, yearId, choices, imageUrl } = body;

 
  

const parsed = questionSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
}






  const questionId = parseInt(id);

  await prisma.choice.deleteMany({ where: { questionId } });

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: {
      text,
      imageUrl: imageUrl || null,
      category: categoryId
        ? { connect: { id: parseInt(categoryId) } }
        : { disconnect: true },
      year: yearId
        ? { connect: { id: parseInt(yearId) } }
        : { disconnect: true },
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
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await prisma.question.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}