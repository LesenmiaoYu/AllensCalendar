import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.DATABASE_URL?.replace("file:", "") || path.join(process.cwd(), "local.db");
const sqlite = new Database(dbPath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    all_day INTEGER NOT NULL DEFAULT 1,
    production_duration REAL NOT NULL DEFAULT 0,
    production_duration_unit TEXT NOT NULL DEFAULT 'hours',
    key_person TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    feishu_event_id TEXT,
    feishu_calendar_id TEXT,
    sync_status TEXT NOT NULL DEFAULT 'local_only',
    local_updated_at TEXT NOT NULL,
    remote_updated_at TEXT,
    sync_error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#FEF991',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

console.log("Migration complete.");
sqlite.close();
