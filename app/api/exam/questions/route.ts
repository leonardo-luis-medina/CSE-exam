import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shuffleArray } from "@/lib/shuffle";

type ExamConfig = { categories: { id: number; count: number }[]; years: string[] };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const examId = searchParams.get("examId");
  const presetId = searchParams.get("presetId");

  let categoriesParam = searchParams.get("categories");
  let yearsParam = searchParams.get("years");

  if (presetId) {
    const preset = await prisma.examPreset.findUnique({ where: { id: parseInt(presetId) } });
    if (!preset) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }
    const config: ExamConfig = JSON.parse(preset.config);
    categoriesParam = config.categories.map((c) => `${c.id}:${c.count}`).join(",");
    yearsParam = config.years && config.years.length > 0 ? config.years.join(",") : null;
  } else if (examId) {
    const exam = await prisma.exam.findUnique({ where: { id: parseInt(examId) } });
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }
    const config: ExamConfig = JSON.parse(exam.config);
    categoriesParam = config.categories.map((c) => `${c.id}:${c.count}`).join(",");
    yearsParam = config.years && config.years.length > 0 ? config.years.join(",") : null;
  }

  const selections: { categoryId: number; count: number }[] = [];
  if (categoriesParam) {
    categoriesParam.split(",").forEach((pair) => {
      const [idStr, countStr] = pair.split(":");
      const catId = parseInt(idStr);
      const count = parseInt(countStr) || 0;
      if (!isNaN(catId)) selections.push({ categoryId: catId, count });
    });
  }
  const categoryIds = selections.map((s) => s.categoryId);

  let yearIdFilter: number[] | null = null;
  let includeReviewer = true;

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
      yearIdFilter = [];
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
          imageUrl: q.imageUrl,
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