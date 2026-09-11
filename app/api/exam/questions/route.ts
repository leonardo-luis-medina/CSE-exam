import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shuffleArray } from "@/lib/shuffle";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoriesParam = searchParams.get("categories"); // e.g. "1:10,2:0,3:25"
  const yearsParam = searchParams.get("years"); // e.g. "2024,2023,reviewer"

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

  // Resolve year filter: convert requested year numbers into Year IDs, track if "reviewer" (null yearId) was requested
  let yearIdFilter: number[] | null = null;
  let includeReviewer = true; // default: no year filter means include everything, including reviewer

  if (yearsParam) {
    const tokens = yearsParam.split(",").map((t) => t.trim());
    includeReviewer = tokens.includes("reviewer");
    const yearNumbers = tokens.filter((t) => t !== "reviewer").map(Number).filter((n) => !isNaN(n));

    if (yearNumbers.length > 0) {
      const matchedYears = await prisma.year.findMany({
        where: { year: { in: yearNumbers } },
      });
      yearIdFilter = matchedYears.map((y) => y.id);
    } else {
      yearIdFilter = []; // only "reviewer" was selected, no specific years
    }
  }

  const categories = await prisma.category.findMany({
    where: categoryIds.length > 0 ? { id: { in: categoryIds } } : undefined,
    include: {
      questions: {
        where: yearsParam
          ? {
              OR: [
                ...(yearIdFilter && yearIdFilter.length > 0
                  ? [{ yearId: { in: yearIdFilter } }]
                  : []),
                ...(includeReviewer ? [{ yearId: null }] : []),
              ],
            }
          : undefined,
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