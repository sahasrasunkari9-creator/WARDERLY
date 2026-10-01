import { NextResponse } from "next/server";
import { clientIp, cors, httpError, preflight, rateLimit } from "@/server/lib/http";
import { recommendDestinations } from "@/server/ai";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
}

/** POST /api/destinations/recommend — destination finder by preferences. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`rec:${ip}`, 30, 60_000)) {
    return cors(httpError(429, "Too many searches. Please wait a moment."));
  }
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return cors(httpError(400, "Request body must be valid JSON."));
  }
  try {
    const recommendations = recommendDestinations({
      budgetLevel: String(body.budgetLevel ?? "mid"),
      interests: Array.isArray(body.interests) ? body.interests.map(String).slice(0, 6) : [],
      season: String(body.season ?? ""),
      days: Number(body.days) || 4,
      region: String(body.region ?? "Any"),
    });
    return cors(NextResponse.json({ success: true, recommendations }));
  } catch (e) {
    console.error("[POST /api/destinations/recommend]", e);
    return cors(httpError(500, "Unable to recommend destinations. Please try again."));
  }
}
