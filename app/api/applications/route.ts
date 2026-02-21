import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET — fetch user's applications
export async function GET(req: NextRequest) {
  const token = req.cookies.get("placeiq_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const applications = await prisma.application.findMany({
    where: { userId: payload.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(applications);
}

// POST — add new application
export async function POST(req: NextRequest) {
  const token = req.cookies.get("placeiq_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { companyName, role, status, ctc, notes, nextStep } = await req.json();

  const application = await prisma.application.create({
    data: {
      userId: payload.userId,
      companyName,
      role,
      status,
      ctc,
      notes,
      nextStep,
      appliedDate: new Date(),
    },
  });

  return NextResponse.json(application);
}