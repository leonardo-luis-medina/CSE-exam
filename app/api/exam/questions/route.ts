import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shuffleArray } from "@/lib/shuffle";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoriesParam = searchParams.get("categories"); // e.g. "1:10,2:0,3:25"

  // Parse "categoryId:count" pairs. count of 0 or missing means "all available".
  const selections: { categoryId: number; count: number }[] = [];
  if (categoriesParam) {
    categoriesParam.split(",").forEach((pair) => {
      const [idStr, countStr] = pair.split(":");
      const id = parseInt(idStr);
      const count = parseInt(countStr) || 0;
      if (!isNaN(id)) selections.push({ categoryId: id, count });
    });
  }

  const categoryIds = selections.map((s) => s.categoryId);

  const categories = await prisma.category.findMany({
    where: categoryIds.length > 0 ? { id: { in: categoryIds } } : undefined,
    include: {
      questions: {
        include: { choices: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const result = categories
    .filter((cat) => cat.questions.length > 0)
    .map((cat) => {
      const selection = selections.find((s) => s.categoryId === cat.id);
      const requestedCount = selection?.count ?? 0;

      let questions = shuffleArray(cat.questions);
      if (requestedCount > 0 && requestedCount < questions.length) {
        questions = questions.slice(0, requestedCount);
      }

      return {
        id: cat.id,
        name: cat.name,
        questions: questions.map((q) => ({
          id: q.id,
          text: q.text,
          choices: shuffleArray(
            q.choices.map((c) => ({
              id: c.id,
              text: c.text,
              isCorrect: c.isCorrect,
            }))
          ),
        })),
      };
    });

  return NextResponse.json(result);
}