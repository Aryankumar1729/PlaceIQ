import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const otp = await prisma.otp.findFirst({
      where: { email, code },
    });

    if (!otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (otp.expiresAt < new Date()) {
      await prisma.otp.delete({ where: { id: otp.id } });
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Mark email as verified
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    // Clean up OTPs
    await prisma.otp.deleteMany({ where: { email } });

    // Issue JWT
    const token = signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({
      message: "Email verified successfully",
      user: { id: user.id, name: user.name, email: user.email },
    });

    res.cookies.set("placeiq_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
