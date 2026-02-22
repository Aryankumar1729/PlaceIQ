import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("placeiq_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { companyId, question, difficulty, category, tags, round, year } = await req.json();

  if (!companyId || !question || !difficulty || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const pyq = await prisma.pYQ.create({
    data: {
      companyId,
      question,
      difficulty,
      category,
      tags: tags ?? [],
      askedCount: 1,
      lastSeen: year ? new Date(`${year}-01-01`) : new Date(),
    },
  });

  return NextResponse.json(pyq);
}