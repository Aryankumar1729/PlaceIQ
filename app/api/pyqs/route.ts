import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get("company");
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const search = searchParams.get("search") ?? "";

  const where = {
    ...(search && { question: { contains: search, mode: "insensitive" as const } }),
    ...(company && { company: { name: { contains: company, mode: "insensitive" as const } } }),
    ...(category && category !== "All" && { category }),
  };


  const [pyqs, total] = await Promise.all([
    prisma.pYQ.findMany({
      where,
      include: { company: true },
      orderBy: { askedCount: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pYQ.count({ where }),
  ]);

  return NextResponse.json({ pyqs, total, page, totalPages: Math.ceil(total / limit) });
}