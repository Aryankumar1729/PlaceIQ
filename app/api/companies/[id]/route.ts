import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const company = await prisma.company.findFirst({
    where: {
      OR: [
        { id: params.id },
        { name: { contains: params.id, mode: "insensitive" } },
      ],
    },
    include: { _count: { select: { pyqs: true } } },
  });

  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(company);
}