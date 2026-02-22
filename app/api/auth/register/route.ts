import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, college, branch, gradYear } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password : hashed, college, branch, gradYear: gradYear ? parseInt(gradYear) : null },
    });

    const token = signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({
      message: "Account created successfully",
      user: { id: user.id, name: user.name, email: user.email },
    });

    res.cookies.set("placeiq_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}