import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  await params; // examId not needed for the update itself, presets already carry their own id
  const { order }: { order: number[] } = await req.json();

  await Promise.all(
    order.map((id, index) =>
      prisma.examPreset.update({ where: { id }, data: { order: index } })
    )
  );

  return NextResponse.json({ success: true });
}