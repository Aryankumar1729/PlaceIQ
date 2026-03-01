import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, college, branch, gradYear } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.emailVerified) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashed = await hashPassword(password);

    if (existing && !existing.emailVerified) {
      // User exists but never verified — update their info
      await prisma.user.update({
        where: { email },
        data: { name, password: hashed, college, branch, gradYear: gradYear ? parseInt(gradYear) : null },
      });
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          provider: "email",
          emailVerified: false,
          college,
          branch,
          gradYear: gradYear ? parseInt(gradYear) : null,
        },
      });
    }

    // Don't auto-login — require OTP verification first
    return NextResponse.json({ message: "Account created. Please verify your email." });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}