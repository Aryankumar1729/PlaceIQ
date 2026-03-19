import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

type ReadinessArea = {
  key: "dsa" | "core" | "resume" | "mock";
  label: string;
  score: number;
  weight: number;
  action: string;
};

const toPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("placeiq_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const [targets, progress, allProgressRows, user, applications] = await Promise.all([
      prisma.prepTarget.findMany({
        where: { userId: payload.userId },
        include: {
          company: {
            include: {
              pyqs: { select: { id: true, category: true } },
              _count: { select: { pyqs: true } },
            },
          },
        },
      }),
      prisma.userPYQProgress.findMany({
        where: { userId: payload.userId },
        include: { pyq: { select: { category: true } } },
      }),
      prisma.userPYQProgress.findMany({
        where: { userId: payload.userId },
        select: { pyqId: true },
      }),
      prisma.user.findUnique({
        where: { id: payload.userId },
        select: { college: true, branch: true, cgpa: true, gradYear: true },
      }),
      prisma.application.findMany({
        where: { userId: payload.userId },
        select: { status: true },
      }),
    ]);

    const totalTargetPyqs = targets.reduce((sum, t) => sum + t.company._count.pyqs, 0);
    const doneCount = allProgressRows.length;
    const dsaScore = totalTargetPyqs > 0 ? toPercent((doneCount / totalTargetPyqs) * 100) : 0;

    const targetCompanyIds = new Set(targets.map((t) => t.companyId));
    const targetPyqCategoryMap = new Map<string, string>();
    targets.forEach((target) => {
      if (!targetCompanyIds.has(target.companyId)) return;
      target.company.pyqs.forEach((pyq) => {
        targetPyqCategoryMap.set(pyq.id, pyq.category);
      });
    });

    const coreTotal = Array.from(targetPyqCategoryMap.values()).filter((category) => category !== "DSA").length;
    const coreDone = progress.filter((p) => p.pyq.category !== "DSA").length;
    const coreScore = coreTotal > 0 ? toPercent((coreDone / coreTotal) * 100) : 30;

    const profileFields = [user?.college, user?.branch, user?.cgpa, user?.gradYear];
    const profileCompleteness = profileFields.filter(Boolean).length / profileFields.length;
    const resumeScore = toPercent(40 + profileCompleteness * 60);

    const interviewStatuses = applications.filter((a) => a.status === "interview" || a.status === "offer").length;
    const mockFromPipeline = Math.min(2, interviewStatuses) * 25;
    const mockFromPractice = Math.min(50, Math.round(doneCount * 1.2));
    const mockScore = toPercent(mockFromPipeline + mockFromPractice);

    const areas: ReadinessArea[] = [
      {
        key: "dsa",
        label: "DSA",
        score: dsaScore,
        weight: 0.4,
        action:
          dsaScore < 60
            ? "Solve 2 medium + 1 easy PYQ daily from your weakest target company for the next 7 days."
            : "Keep momentum with one mixed-difficulty PYQ block daily.",
      },
      {
        key: "core",
        label: "Core Subjects",
        score: coreScore,
        weight: 0.2,
        action:
          coreScore < 60
            ? "Add 3 non-DSA questions this week (CS fundamentals/aptitude/technical round topics)."
            : "Revise one core-subject sheet before each mock test.",
      },
      {
        key: "resume",
        label: "Resume",
        score: resumeScore,
        weight: 0.2,
        action:
          resumeScore < 70
            ? "Improve 2 bullets with measurable impact and complete missing profile details in your account."
            : "Tailor your top project bullets for your next target company JD.",
      },
      {
        key: "mock",
        label: "Mock Interview",
        score: mockScore,
        weight: 0.2,
        action:
          mockScore < 60
            ? "Do 2 timed mocks this week: one DSA (90 min) and one interview simulation (60 min)."
            : "Run one full mock and review mistakes within 24 hours.",
      },
    ];

    const weighted = areas.reduce((sum, area) => sum + area.score * area.weight, 0);
    const overall = toPercent(weighted);

    const weakAreas = [...areas]
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .map((a) => ({ label: a.label, score: a.score, action: a.action }));

    return NextResponse.json({
      overall,
      areas,
      weakAreas,
      insight:
        weakAreas.length > 0
          ? `Biggest gap: ${weakAreas[0].label}. Focus there first to improve your readiness fastest.`
          : "Great consistency across all readiness areas.",
    });
  } catch (error) {
    console.error("Readiness score failed:", error);
    return NextResponse.json({ error: "Failed to compute readiness score" }, { status: 500 });
  }
}
