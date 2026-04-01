import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";

export async function GET() {
  const authenticated = await verifySession();
  return NextResponse.json({ authenticated });
}
