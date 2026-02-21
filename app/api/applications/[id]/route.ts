import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// PATCH — update status or notes
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("placeiq_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const data = await req.json();

  const application = await prisma.application.update({
    where: { id: params.id, userId: payload.userId },
    data,
  });

  return NextResponse.json(application);
}

// DELETE — remove application
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get("placeiq_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  await prisma.application.delete({
    where: { id: params.id, userId: payload.userId },
  });

  return NextResponse.json({ success: true });
}