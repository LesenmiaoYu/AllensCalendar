import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq, and, gte, lte, like, isNull, or } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/middleware";
import { createEventSchema } from "@/lib/validators/event";
import { NextRequest, NextResponse } from "next/server";
import { ulid } from "ulid";

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const category = searchParams.get("category");
    const keyPerson = searchParams.get("keyPerson");
    const content = searchParams.get("content");
    const search = searchParams.get("search");

    const conditions = [isNull(events.deletedAt)];

    if (start) conditions.push(gte(events.date, start));
    if (end) conditions.push(lte(events.date, end));
    if (category) conditions.push(eq(events.category, category));
    if (keyPerson) conditions.push(eq(events.keyPerson, keyPerson));
    if (content)
      conditions.push(
        eq(events.content, content as "settings" | "models")
      );
    if (search) {
      conditions.push(
        or(
          like(events.title, `%${search}%`),
          like(events.description, `%${search}%`)
        )!
      );
    }

    const result = await db
      .select()
      .from(events)
      .where(and(...conditions));

    return NextResponse.json({ events: result });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = createEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const id = ulid();

    const [event] = await db
      .insert(events)
      .values({
        id,
        ...parsed.data,
        syncStatus: "local_only",
        localUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json({ event }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
