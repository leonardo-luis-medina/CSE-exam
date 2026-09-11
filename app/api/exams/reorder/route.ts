import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { order }: { order: number[] } = await req.json();

  await Promise.all(
    order.map((id, index) =>
      prisma.exam.update({ where: { id }, data: { order: index } })
    )
  );

  return NextResponse.json({ success: true });
}