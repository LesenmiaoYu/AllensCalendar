import { NextRequest, NextResponse } from "next/server";
import { createSession, getSessionCookieName } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin || typeof pin !== "string") {
      return NextResponse.json(
        { error: "PIN is required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    if (pin !== process.env.AUTH_PIN) {
      return NextResponse.json(
        { error: "Invalid PIN", code: "INVALID_PIN" },
        { status: 401 }
      );
    }

    const token = await createSession();
    const response = NextResponse.json({ success: true });

    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
