export type SyncStatus =
  | "local_only"
  | "pending_sync"
  | "synced"
  | "pending_pull"
  | "conflict"
  | "error";

export type ContentType = "settings" | "models";
export type DurationUnit = "hours" | "days";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  date: string; // ISO 8601 date
  startTime?: string | null;
  endTime?: string | null;
  allDay: boolean;
  productionDuration: number;
  productionDurationUnit: DurationUnit;
  keyPerson: string;
  content: ContentType;
  category: string;
  feishuEventId?: string | null;
  feishuCalendarId?: string | null;
  syncStatus: SyncStatus;
  localUpdatedAt: string;
  remoteUpdatedAt?: string | null;
  syncError?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: string;
}

export interface EventFormData {
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  productionDuration: number;
  productionDurationUnit: DurationUnit;
  keyPerson: string;
  content: ContentType;
  category: string;
}

export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}
