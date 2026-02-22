import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const [companies, pyqs, users] = await Promise.all([
    prisma.company.count(),
    prisma.pYQ.count(),
    prisma.user.count(),
  ]);

  // Calculate prep score for logged in user
  let prepScore = "—";
  const token = req.cookies.get("placeiq_token")?.value;
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const targets = await prisma.prepTarget.findMany({
        where: { userId: payload.userId },
        include: { company: { include: { _count: { select: { pyqs: true } } } } },
      });

      if (targets.length > 0) {
        const totalQuestions = targets.reduce((sum, t) => sum + t.company._count.pyqs, 0);
        const done = await prisma.userPYQProgress.count({
          where: { userId: payload.userId },
        });
        prepScore = totalQuestions > 0
          ? `${Math.round((done / totalQuestions) * 100)}%`
          : "0%";
      }
    }
  }

  return NextResponse.json({ companies, pyqs, users, prepScore });
}