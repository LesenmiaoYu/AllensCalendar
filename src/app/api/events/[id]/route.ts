import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/middleware";
import { updateEventSchema } from "@/lib/validators/event";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await context.params;

    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), isNull(events.deletedAt)));

    if (!event) {
      return NextResponse.json(
        { error: "Not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateEventSchema.safeParse(body);

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

    // Check event exists and is not deleted
    const [existing] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), isNull(events.deletedAt)));

    if (!existing) {
      return NextResponse.json(
        { error: "Not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    const [event] = await db
      .update(events)
      .set({
        ...parsed.data,
        updatedAt: now,
        localUpdatedAt: now,
      })
      .where(eq(events.id, id))
      .returning();

    return NextResponse.json({ event });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await context.params;

    // Check event exists and is not already deleted
    const [existing] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), isNull(events.deletedAt)));

    if (!existing) {
      return NextResponse.json(
        { error: "Not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    const [event] = await db
      .update(events)
      .set({
        deletedAt: now,
        updatedAt: now,
        localUpdatedAt: now,
      })
      .where(eq(events.id, id))
      .returning();

    return NextResponse.json({ event });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
