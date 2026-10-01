import { NextResponse } from "next/server";
import { clientIp, cors, httpError, preflight, rateLimit } from "@/server/lib/http";
import { destinationById, runTripGeneration } from "@/server/ai";
import { INTERESTS, SEASONS, TRAVEL_STYLES, type TripRequest } from "@/lib/travelTypes";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
}

/** POST /api/trips/generate — generate (and return) a full trip plan. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`gen:${ip}`, 12, 5 * 60_000)) {
    return cors(httpError(429, "You're generating a lot of trips. Give it a few minutes."));
  }
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return cors(httpError(400, "Request body must be valid JSON."));
  }

  const destId = String(body.destination ?? "").trim();
  if (!destinationById(destId)) {
    return cors(httpError(400, "Please choose a valid destination."));
  }
  const destinations = Array.isArray(body.destinations)
    ? body.destinations.map(String).filter((d) => destinationById(d)).slice(0, 3)
    : [destId];
  if (!destinations.length) return cors(httpError(400, "Please choose at least one destination."));

  const tripReq: TripRequest = {
    destination: destinations[0],
    destinations,
    days: Math.min(Math.max(Number(body.days) || 3, 2), 14),
    travelers: Math.min(Math.max(Number(body.travelers) || 1, 1), 10),
    style: (TRAVEL_STYLES as readonly string[]).includes(String(body.style))
      ? (String(body.style) as TripRequest["style"])
      : "Adventure",
    interests: Array.isArray(body.interests)
      ? (body.interests.filter((i) => (INTERESTS as readonly string[]).includes(String(i))) as TripRequest["interests"])
      : [],
    season: (SEASONS as readonly string[]).includes(String(body.season))
      ? (String(body.season) as TripRequest["season"])
      : SEASONS[4],
    totalBudget: Math.min(Math.max(Number(body.totalBudget) || 0, 0), 500_000),
  };

  try {
    const trip = await runTripGeneration(tripReq);
    return cors(NextResponse.json({ success: true, trip }));
  } catch (e) {
    console.error("[POST /api/trips/generate]", e);
    return cors(httpError(500, "Unable to generate your trip. Please try again."));
  }
}
