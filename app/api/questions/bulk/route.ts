import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type BulkRow = {
  year?: string;
  category: string;
  question: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correctChoice: string;
};

export async function POST(req: Request) {
  const { rows }: { rows: BulkRow[] } = await req.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const categories = await prisma.category.findMany();
  const years = await prisma.year.findMany();

  const categoryMap = new Map(
    categories.map((c) => [c.name.toLowerCase().trim(), c.id])
  );
  const yearMap = new Map(years.map((y) => [y.year.toString(), y.id]));

  const errors: string[] = [];
  const validQuestions: {
    text: string;
    categoryId: number;
    yearId?: number;
    choices: { text: string; isCorrect: boolean }[];
  }[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2;

    const categoryId = categoryMap.get((row.category || "").toLowerCase().trim());
    if (!categoryId) {
      errors.push(`Row ${rowNum}: Category "${row.category}" not found.`);
      return;
    }

    let yearId: number | undefined = undefined;
    if (row.year && row.year.trim() !== "") {
      const found = yearMap.get(row.year.trim());
      if (!found) {
        errors.push(`Row ${rowNum}: Year "${row.year}" not found.`);
        return;
      }
      yearId = found;
    }

    if (!row.question || !row.question.trim()) {
      errors.push(`Row ${rowNum}: Missing question text.`);
      return;
    }

    const choiceTexts = [row.choice1, row.choice2, row.choice3, row.choice4];
    if (choiceTexts.some((c) => !c || !c.trim())) {
      errors.push(`Row ${rowNum}: All 4 choices are required.`);
      return;
    }

    const correctNum = parseInt(row.correctChoice);
    if (![1, 2, 3, 4].includes(correctNum)) {
      errors.push(`Row ${rowNum}: correctChoice must be 1, 2, 3, or 4.`);
      return;
    }

    const choices = choiceTexts.map((text, i) => ({
      text: text.trim(),
      isCorrect: i + 1 === correctNum,
    }));

    validQuestions.push({
      text: row.question.trim(),
      categoryId,
      yearId,
      choices,
    });
  });

  if (errors.length > 0) {
    return NextResponse.json({ errors, imported: 0 }, { status: 400 });
  }

  let imported = 0;
  for (const q of validQuestions) {
    await prisma.question.create({
      data: {
        text: q.text,
        categoryId: q.categoryId,
        yearId: q.yearId,
        choices: { create: q.choices },
      },
    });
    imported++;
  }

  return NextResponse.json({ imported, errors: [] });
}