import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Rate limit: max 1 OTP per email per 60 seconds
    const recent = await prisma.otp.findFirst({
      where: {
        email,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recent) {
      return NextResponse.json({ error: "Please wait 60 seconds before requesting another OTP" }, { status: 429 });
    }

    // Clean up old OTPs for this email
    await prisma.otp.deleteMany({ where: { email } });

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otp.create({
      data: { email, code, expiresAt },
    });

    // Send OTP via Resend
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "PlaceIQ <onboarding@resend.dev>",
      to: email,
      subject: "PlaceIQ — Verify your email",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 32px;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Verify your email</h2>
          <p style="color: #666; font-size: 14px; margin-bottom: 24px;">
            Enter this code to complete your PlaceIQ registration:
          </p>
          <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #18181b;">${code}</span>
          </div>
          <p style="color: #999; font-size: 12px;">
            This code expires in 10 minutes. If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
