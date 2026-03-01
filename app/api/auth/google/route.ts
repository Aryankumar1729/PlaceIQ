import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ error: "Missing Google credential" }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
    }

    const { email, name, picture } = payload;

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name ?? "Google User",
          email,
          provider: "google",
          emailVerified: true, // Google emails are pre-verified
        },
      });
    } else if (user.provider === "email" && !user.emailVerified) {
      // If they registered via email but never verified, update to google
      user = await prisma.user.update({
        where: { id: user.id },
        data: { provider: "google", emailVerified: true },
      });
    }

    const token = signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({
      message: "Logged in with Google",
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
    console.error("Google auth error:", err);
    return NextResponse.json({ error: "Google authentication failed" }, { status: 500 });
  }
}
