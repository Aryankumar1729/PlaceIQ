import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [companies, pyqs, users] = await Promise.all([
    prisma.company.count(),
    prisma.pYQ.count(),
    prisma.user.count(),
  ]);

  return NextResponse.json({ companies, pyqs, users });
}