import { pgTable, text, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** A saved AI-generated trip with itinerary, budget and packing list. */
export const trips = pgTable(
  "trips",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    destination: text("destination").notNull().default(""),
    destinations: jsonb("destinations").$type<string[]>().notNull().default([]),
    days: integer("days").notNull().default(3),
    travelers: integer("travelers").notNull().default(1),
    style: text("style").notNull().default("Adventure"),
    interests: jsonb("interests").$type<string[]>().notNull().default([]),
    season: text("season").notNull().default(""),
    totalBudget: integer("total_budget").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    itinerary: jsonb("itinerary").$type<
      { day: number; title: string; morning: string; afternoon: string; evening: string; tip: string }[]
    >().notNull().default([]),
    budgetBreakdown: jsonb("budget_breakdown").$type<Record<string, number>>().notNull().default({}),
    packing: jsonb("packing").$type<string[]>().notNull().default([]),
    tips: jsonb("tips").$type<string[]>().notNull().default([]),
    generationMode: text("generation_mode").notNull().default("demo"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    userIdx: index("trips_user_idx").on(t.userId),
  })
);
