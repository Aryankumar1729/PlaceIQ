import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("placeiq_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { name, college, branch, cgpa, gradYear } = await req.json();

  const user = await prisma.user.update({
    where: { id: payload.userId },
    data: { name, college, branch, cgpa, gradYear },
    select: { id: true, name: true, email: true, college: true, branch: true, cgpa: true, gradYear: true },
  });

  return NextResponse.json({ user });
}
