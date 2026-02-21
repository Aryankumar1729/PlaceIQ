import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("placeiq_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const targets = await prisma.prepTarget.findMany({
    where: { userId: payload.userId },
    include: {
      company: {
        include: { _count: { select: { pyqs: true } } }
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get progress count for each target
  const targetsWithProgress = await Promise.all(
    targets.map(async (t) => {
      const done = await prisma.userPYQProgress.count({
        where: { userId: payload.userId, companyId: t.companyId },
      });
      return { ...t, done, total: t.company._count.pyqs };
    })
  );

  return NextResponse.json(targetsWithProgress);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("placeiq_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { companyId } = await req.json();

  const target = await prisma.prepTarget.upsert({
    where: { userId_companyId: { userId: payload.userId, companyId } },
    update: {},
    create: { userId: payload.userId, companyId },
    include: { company: true },
  });

  return NextResponse.json(target);
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("placeiq_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { companyId } = await req.json();

  await prisma.prepTarget.delete({
    where: { userId_companyId: { userId: payload.userId, companyId } },
  });

  return NextResponse.json({ success: true });
}