import { db } from "@/lib/db";
import { categories, events } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/middleware";
import { updateCategorySchema } from "@/lib/validators/category";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

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

    // Check category exists
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: "Not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const [category] = await db
      .update(categories)
      .set(parsed.data)
      .where(eq(categories.id, id))
      .returning();

    return NextResponse.json({ category });
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

    // Check category exists
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: "Not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Check if any non-deleted events reference this category
    const referencingEvents = await db
      .select({ id: events.id })
      .from(events)
      .where(
        and(eq(events.category, existing.slug), isNull(events.deletedAt))
      )
      .limit(1);

    if (referencingEvents.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with existing events",
          code: "CATEGORY_IN_USE",
        },
        { status: 400 }
      );
    }

    await db.delete(categories).where(eq(categories.id, id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
