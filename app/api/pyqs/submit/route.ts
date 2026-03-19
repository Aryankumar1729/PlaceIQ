import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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

function scoreSourceReputation(sourceType: string, sourceUrl?: string | null) {
  const value = sourceType.toLowerCase();
  if (value === "official") return 0.95;
  if (value === "verified_peer") return 0.8;
  if (value === "community") return 0.55;
  if (value === "scraped") {
    if (!sourceUrl) return 0.45;
    if (sourceUrl.includes("leetcode.com") || sourceUrl.includes("geeksforgeeks.org")) return 0.6;
    return 0.45;
  }
  return 0.5;
}

function initialConfidence(params: {
  sourceReputation: number;
  question: string;
  tags: string[];
  year?: number | null;
}) {
  const recencyBoost = params.year && params.year >= new Date().getFullYear() - 1 ? 0.08 : 0;
  const lengthBoost = params.question.length > 40 ? 0.06 : 0;
  const tagsBoost = params.tags.length >= 2 ? 0.05 : 0;
  return Math.min(0.95, Number((params.sourceReputation * 0.7 + recencyBoost + lengthBoost + tagsBoost).toFixed(3)));
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("placeiq_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const {
    companyId,
    question,
    difficulty,
    category,
    tags,
    round,
    year,
    source,
    sourceType,
    sourceUrl,
  } = await req.json();

  if (!companyId || !question || !difficulty || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const normalizedTags = Array.isArray(tags) ? tags : [];
  const computedSourceType = typeof sourceType === "string" && sourceType.trim() ? sourceType : "community";
  const sourceReputation = scoreSourceReputation(computedSourceType, sourceUrl);
  const confidenceScore = initialConfidence({
    sourceReputation,
    question,
    tags: normalizedTags,
    year: typeof year === "number" ? year : null,
  });
  const dedupeGroup = `${companyId}::${normalizeQuestionForDedupe(question)}`;

  const pyq = await prisma.pYQ.create({
    data: {
      companyId,
      question,
      difficulty,
      category,
      tags: normalizedTags,
      askedCount: 1,
      lastSeen: year ? new Date(`${year}-01-01`) : new Date(),
      source: source ?? null,
      sourceType: computedSourceType,
      sourceUrl: sourceUrl ?? null,
      sourceReputation,
      confidenceScore,
      dedupeGroup,
      reviewStatus: "pending",
      reviewNotes: round ? `Round context: ${round}` : null,
    } as any,
  });

  return NextResponse.json(pyq);
}