import { verifySession } from "./session";
import { NextRequest, NextResponse } from "next/server";

export async function requireAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  // Check API key first (for Figma plugin / Raycast)
  const apiKey = request.headers.get("authorization")?.replace("Bearer ", "");
  if (apiKey && apiKey === process.env.API_KEY) return null;

  // Check session cookie
  const isValid = await verifySession();
  if (isValid) return null;

  return NextResponse.json(
    { error: "Unauthorized", code: "UNAUTHORIZED" },
    { status: 401 }
  );
}
