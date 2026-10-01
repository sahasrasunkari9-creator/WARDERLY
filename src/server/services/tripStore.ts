import { desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { trips, users } from "@/db/schema";
import type { GeneratedTrip, TripRow } from "@/lib/travelTypes";

export const DEMO_USER_ID = "user_demo";

export async function ensureDemoUser() {
  const existing = await db.select().from(users).where(eq(users.id, DEMO_USER_ID)).limit(1);
  if (existing.length) return existing[0];
  const [created] = await db
    .insert(users)
    .values({ id: DEMO_USER_ID, name: "Demo Traveler", email: "traveler@demo.app" })
    .returning();
  return created;
}

function mapRow(row: typeof trips.$inferSelect): TripRow {
  return {
    ...row,
    destinations: Array.isArray(row.destinations) ? row.destinations : [],
    interests: Array.isArray(row.interests) ? row.interests : [],
    itinerary: Array.isArray(row.itinerary) ? row.itinerary : [],
    budgetBreakdown: row.budgetBreakdown ?? {},
    packing: Array.isArray(row.packing) ? row.packing : [],
    tips: Array.isArray(row.tips) ? row.tips : [],
    generationMode: row.generationMode === "ai" ? "ai" : "demo",
  };
}

export async function saveTrip(trip: GeneratedTrip): Promise<TripRow> {
  const [row] = await db
    .insert(trips)
    .values({
      id: randomUUID(),
      userId: DEMO_USER_ID,
      title: trip.title.slice(0, 160),
      destination: trip.destination.slice(0, 80),
      destinations: trip.destinations.slice(0, 3),
      days: Math.min(Math.max(trip.days, 1), 30),
      travelers: Math.min(Math.max(trip.travelers, 1), 20),
      style: trip.style.slice(0, 30),
      interests: trip.interests.slice(0, 10),
      season: trip.season.slice(0, 40),
      totalBudget: Math.min(Math.max(trip.totalBudget, 0), 10_000_000),
      currency: "USD",
      itinerary: trip.itinerary.slice(0, 30),
      budgetBreakdown: trip.budgetBreakdown,
      packing: trip.packing.slice(0, 40),
      tips: trip.tips.slice(0, 15),
      generationMode: trip.mode,
    })
    .returning();
  return mapRow(row);
}

export async function listTrips(userId: string): Promise<TripRow[]> {
  const rows = await db
    .select()
    .from(trips)
    .where(eq(trips.userId, userId))
    .orderBy(desc(trips.updatedAt));
  return rows.map(mapRow);
}

export async function getTrip(id: string): Promise<TripRow | null> {
  const rows = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function deleteTrip(id: string): Promise<boolean> {
  const deleted = await db.delete(trips).where(eq(trips.id, id)).returning();
  return deleted.length > 0;
}
