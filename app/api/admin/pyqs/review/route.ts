import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const ADMIN_REVIEW_KEY = process.env.ADMIN_REVIEW_KEY;

type AdminAuth = {
  authorized: boolean;
  reviewedBy: string;
};

async function getAdminAuth(req: NextRequest): Promise<AdminAuth> {
  const incoming = req.headers.get("x-admin-review-key") ?? "";
  if (Boolean(ADMIN_REVIEW_KEY) && incoming === ADMIN_REVIEW_KEY) {
    return { authorized: true, reviewedBy: "admin_key" };
  }

  const token = req.cookies.get("placeiq_token")?.value;
  if (!token) return { authorized: false, reviewedBy: "" };

  const payload = verifyToken(token);
  if (!payload) return { authorized: false, reviewedBy: "" };

  const user = (await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true } as any,
  })) as any;

  if (!user || user.role !== "admin") return { authorized: false, reviewedBy: "" };

  return { authorized: true, reviewedBy: user.email ?? user.id };
}

function normalizeQuestionForDedupe(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 18)
    .join(" ");
}

export async function GET(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";
  const companyId = searchParams.get("companyId") ?? undefined;
  const limit = Math.min(100, Number(searchParams.get("limit") ?? "25"));

  const items = await prisma.pYQ.findMany({
    where: {
      reviewStatus: status,
      ...(companyId ? { companyId } : {}),
    } as any,
    include: { company: { select: { id: true, name: true, shortName: true } } },
    orderBy: [{ confidenceScore: "asc" }, { createdAt: "desc" }] as any,
    take: limit,
  });

  return NextResponse.json(items);
}

export async function PATCH(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    pyqId,
    action,
    reviewNotes,
    confidenceScore,
    sourceType,
    sourceUrl,
    sourceReputation,
    reviewedBy,
  } = body;

  if (!pyqId || !action) {
    return NextResponse.json({ error: "Missing pyqId or action" }, { status: 400 });
  }

  if (!["approve", "reject", "needs_changes"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const pyq = (await prisma.pYQ.findUnique({ where: { id: pyqId } })) as any;
  if (!pyq) return NextResponse.json({ error: "PYQ not found" }, { status: 404 });

  const nextStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "needs_changes";

  const updated = await prisma.pYQ.update({
    where: { id: pyqId },
    data: {
      reviewStatus: nextStatus,
      verified: action === "approve",
      reviewNotes: reviewNotes ?? null,
      confidenceScore:
        typeof confidenceScore === "number"
          ? Math.max(0, Math.min(1, confidenceScore))
          : pyq.confidenceScore,
      sourceType: typeof sourceType === "string" && sourceType.trim() ? sourceType : pyq.sourceType,
      sourceUrl: sourceUrl ?? pyq.sourceUrl,
      sourceReputation:
        typeof sourceReputation === "number"
          ? Math.max(0, Math.min(1, sourceReputation))
          : pyq.sourceReputation,
      reviewedAt: new Date(),
      reviewedBy: reviewedBy ?? auth.reviewedBy,
      dedupeGroup: `${pyq.companyId}::${normalizeQuestionForDedupe(pyq.question)}`,
    } as any,
  });

  return NextResponse.json(updated);
}
