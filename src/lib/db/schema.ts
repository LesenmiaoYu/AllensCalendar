import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";

export const events = sqliteTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  allDay: integer("all_day", { mode: "boolean" }).notNull().default(true),
  productionDuration: real("production_duration").notNull().default(0),
  productionDurationUnit: text("production_duration_unit", {
    enum: ["hours", "days"],
  })
    .notNull()
    .default("hours"),
  keyPerson: text("key_person").notNull(),
  content: text("content", { enum: ["settings", "models"] }).notNull(),
  category: text("category").notNull(),
  feishuEventId: text("feishu_event_id"),
  feishuCalendarId: text("feishu_calendar_id"),
  syncStatus: text("sync_status", {
    enum: [
      "local_only",
      "pending_sync",
      "synced",
      "pending_pull",
      "conflict",
      "error",
    ],
  })
    .notNull()
    .default("local_only"),
  localUpdatedAt: text("local_updated_at").notNull(),
  remoteUpdatedAt: text("remote_updated_at"),
  syncError: text("sync_error"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  deletedAt: text("deleted_at"),
});

export const categories = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#FEF991"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
