import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const tier = searchParams.get("tier") ?? "";
  const type = searchParams.get("type") ?? "";

  const companies = await prisma.company.findMany({
    where: {
      ...(search && { name: { contains: search, mode: "insensitive" as const } }),
      ...(tier && { tier }),
      ...(type && { type: { contains: type, mode: "insensitive" as const } }),
    },
    include: {
      _count: { select: { pyqs: true } },
    },
    orderBy: { baseCTC: "desc" },
  });

  return NextResponse.json(companies);
}