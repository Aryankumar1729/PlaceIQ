import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

type PlanItem = {
  id: string;
  pyqId: string;
  question: string;
  difficulty: string;
  category: string;
  companyName: string;
  askedCount: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("placeiq_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const days = clamp(parseInt(searchParams.get("days") ?? "7", 10) || 7, 3, 21);
    const questionsTarget = days <= 7 ? 10 : 15;

    const targets = await prisma.prepTarget.findMany({
      where: { userId: payload.userId },
      include: {
        company: {
          include: {
            pyqs: {
              select: {
                id: true,
                question: true,
                difficulty: true,
                category: true,
                askedCount: true,
              },
              orderBy: [{ askedCount: "desc" }, { lastSeen: "desc" }],
            },
            _count: { select: { pyqs: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (targets.length === 0) {
      return NextResponse.json({
        days,
        summary: "Add at least one prep target to generate your weekly plan.",
        pyqs: [],
        mockTests: [],
        resumeTask: null,
      });
    }

    const progressRows = await prisma.userPYQProgress.findMany({
      where: { userId: payload.userId },
      select: { pyqId: true, companyId: true },
    });

    const doneSet = new Set(progressRows.map((p) => p.pyqId));

    const targetMeta = targets.map((t) => {
      const total = t.company._count.pyqs;
      const done = progressRows.filter((p) => p.companyId === t.companyId).length;
      const ratio = total > 0 ? done / total : 0;
      return {
        companyId: t.companyId,
        companyName: t.company.name,
        shortName: t.company.shortName,
        ratio,
        pending: t.company.pyqs.filter((q) => !doneSet.has(q.id)),
      };
    });

    const focusTargets = [...targetMeta]
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, Math.min(3, targetMeta.length));

    const pool: PlanItem[] = focusTargets
      .flatMap((target) =>
        target.pending.map((q) => ({
          id: `${target.companyId}-${q.id}`,
          pyqId: q.id,
          question: q.question,
          difficulty: q.difficulty,
          category: q.category,
          askedCount: q.askedCount,
          companyName: target.companyName,
        }))
      )
      .sort((a, b) => b.askedCount - a.askedCount);

    const bucketed = {
      easy: pool.filter((p) => p.difficulty === "Easy"),
      medium: pool.filter((p) => p.difficulty === "Medium"),
      hard: pool.filter((p) => p.difficulty === "Hard"),
      other: pool.filter((p) => !["Easy", "Medium", "Hard"].includes(p.difficulty)),
    };

    const pick = (arr: PlanItem[], count: number) => arr.slice(0, Math.max(0, count));

    const easyCount = Math.round(questionsTarget * 0.35);
    const mediumCount = Math.round(questionsTarget * 0.45);
    const hardCount = questionsTarget - easyCount - mediumCount;

    let selected = [
      ...pick(bucketed.easy, easyCount),
      ...pick(bucketed.medium, mediumCount),
      ...pick(bucketed.hard, hardCount),
    ];

    if (selected.length < questionsTarget) {
      const used = new Set(selected.map((s) => s.pyqId));
      const filler = [...bucketed.other, ...pool].filter((p) => !used.has(p.pyqId));
      selected = [...selected, ...filler.slice(0, questionsTarget - selected.length)];
    }

    selected = selected.slice(0, questionsTarget);

    const mixByCategory = selected.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {});

    const weakest = [...targetMeta].sort((a, b) => a.ratio - b.ratio)[0];
    const focusCompanyText = weakest ? `${weakest.companyName} (${Math.round(weakest.ratio * 100)}%)` : "your targets";

    const topCategory = Object.entries(mixByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "DSA";

    const mockTests = [
      {
        id: "mock-1",
        title: "Timed DSA Mock",
        durationMinutes: 90,
        focus: `${topCategory} + medium/hard mix`,
        schedule: days <= 7 ? "Day 4" : "Day 6",
      },
      {
        id: "mock-2",
        title: "Interview Simulation Mock",
        durationMinutes: 60,
        focus: `Top target: ${focusCompanyText}`,
        schedule: days <= 7 ? "Day 7" : "Day 12",
      },
    ];

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { college: true, branch: true, cgpa: true, gradYear: true },
    });

    const profileGaps = [
      !user?.college ? "college" : null,
      !user?.branch ? "branch" : null,
      !user?.cgpa ? "cgpa" : null,
      !user?.gradYear ? "grad year" : null,
    ].filter(Boolean);

    const resumeTask = {
      id: "resume-1",
      title: profileGaps.length
        ? `Update resume + profile (${profileGaps.slice(0, 2).join(", ")})`
        : "Improve resume impact bullets",
      detail: profileGaps.length
        ? "Fill missing profile basics and align your resume header/education section with portal data."
        : "Add quantified outcomes to at least 2 project bullets (metrics, scale, latency, users, or impact).",
      estimatedMinutes: 40,
    };

    return NextResponse.json({
      days,
      summary: `This ${days}-day plan prioritizes weaker targets first, with ${selected.length} PYQs, 2 mocks, and 1 resume task.`,
      pyqs: selected,
      mockTests,
      resumeTask,
    });
  } catch (error) {
    console.error("Weekly plan generation failed:", error);
    return NextResponse.json({ error: "Failed to generate weekly plan" }, { status: 500 });
  }
}
