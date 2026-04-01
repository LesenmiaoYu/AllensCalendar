import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(getSessionCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
