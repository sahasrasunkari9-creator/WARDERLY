import { NextResponse } from "next/server";
import { clientIp, cors, httpError, preflight, rateLimit } from "@/server/lib/http";
import { DEMO_USER_ID, ensureDemoUser, listTrips, saveTrip } from "@/server/services/tripStore";
import type { GeneratedTrip } from "@/lib/travelTypes";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
}

/** GET /api/trips — saved trips. */
export async function GET(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`trips:${ip}`, 120, 60_000)) {
    return cors(httpError(429, "Too many requests. Please slow down."));
  }
  try {
    await ensureDemoUser();
    const list = await listTrips(DEMO_USER_ID);
    return cors(NextResponse.json({ success: true, trips: list }));
  } catch (e) {
    console.error("[GET /api/trips]", e);
    return cors(httpError(500, "We couldn't load your trips. Please try again."));
  }
}

/** POST /api/trips — save a generated trip. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`savetrip:${ip}`, 15, 5 * 60_000)) {
    return cors(httpError(429, "Too many saves. Please wait a moment."));
  }
  let trip: GeneratedTrip;
  try {
    trip = (await req.json()) as GeneratedTrip;
  } catch {
    return cors(httpError(400, "Request body must be valid JSON."));
  }
  if (!trip || !Array.isArray(trip.itinerary) || !trip.itinerary.length) {
    return cors(httpError(400, "A trip needs an itinerary before saving."));
  }
  try {
    await ensureDemoUser();
    const row = await saveTrip(trip);
    return cors(NextResponse.json({ success: true, trip: row }));
  } catch (e) {
    console.error("[POST /api/trips]", e);
    return cors(httpError(500, "We couldn't save your trip. Please try again."));
  }
}
