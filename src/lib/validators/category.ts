import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Must be lowercase with hyphens"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be hex color"),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.partial();
