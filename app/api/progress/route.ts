import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("placeiq_token")?.value;
  if (!token) return NextResponse.json([]);
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json([]);

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") ?? "";
  const breakdown = searchParams.get("breakdown") === "true";

  const progress = await prisma.userPYQProgress.findMany({
    where: { userId: payload.userId, ...(companyId && { companyId }) },
    include: { pyq: { select: { difficulty: true } } },
  });

  if (breakdown) {
    return NextResponse.json({
      ids: progress.map((p) => p.pyqId),
      easy: progress.filter((p) => p.pyq.difficulty === "Easy").length,
      medium: progress.filter((p) => p.pyq.difficulty === "Medium").length,
      hard: progress.filter((p) => p.pyq.difficulty === "Hard").length,
    });
  }

  return NextResponse.json(progress.map((p) => p.pyqId));
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("placeiq_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { pyqId, companyId } = await req.json();

  const existing = await prisma.userPYQProgress.findUnique({
    where: { userId_pyqId: { userId: payload.userId, pyqId } },
  });

  if (existing) {
    await prisma.userPYQProgress.delete({
      where: { userId_pyqId: { userId: payload.userId, pyqId } },
    });
    return NextResponse.json({ done: false });
  } else {
    await prisma.userPYQProgress.create({
      data: { userId: payload.userId, pyqId, companyId },
    });
    return NextResponse.json({ done: true });
  }
}