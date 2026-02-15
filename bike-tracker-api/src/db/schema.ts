import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ── Users ──────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  appleId: text("apple_id").unique(),
  passwordHash: text("password_hash"),
  name: text("name").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── Routes ─────────────────────
export const routes = sqliteTable("routes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title"),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  distanceM: real("distance_m").default(0),
  durationS: integer("duration_s").default(0),
  avgSpeedKmh: real("avg_speed_kmh").default(0),
  maxSpeedKmh: real("max_speed_kmh").default(0),
  status: text("status", { enum: ["recording", "completed"] })
    .notNull()
    .default("recording"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ── Route Points ───────────────
export const routePoints = sqliteTable("route_points", {
  id: text("id").primaryKey(),
  routeId: text("route_id")
    .notNull()
    .references(() => routes.id, { onDelete: "cascade" }),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  altitude: real("altitude"),
  speed: real("speed"),
  heading: real("heading"),
  accuracy: real("accuracy"),
  recordedAt: text("recorded_at").notNull(),
});
