import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO date"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  allDay: z.boolean().default(true),
  productionDuration: z.number().min(0).default(0),
  productionDurationUnit: z.enum(["hours", "days"]).default("hours"),
  keyPerson: z.string().min(1, "Key person is required"),
  content: z.enum(["settings", "models"]),
  category: z.string().min(1, "Category is required"),
});

export const updateEventSchema = createEventSchema.partial();

export const moveEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO date"),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
});
