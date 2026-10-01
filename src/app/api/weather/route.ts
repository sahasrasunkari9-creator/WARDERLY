import { NextResponse } from "next/server";
import { cors, httpError, preflight } from "@/server/lib/http";
import { destinationById, sampleWeather } from "@/server/ai";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
}

/** GET /api/weather?dest=<id> — clearly-labeled sample climate (not a live forecast). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const dest = url.searchParams.get("dest") ?? "";
  if (!destinationById(dest)) {
    return cors(httpError(400, "Please provide a valid destination."));
  }
  try {
    const weather = sampleWeather(dest);
    return cors(NextResponse.json({ success: true, weather }));
  } catch (e) {
    console.error("[GET /api/weather]", e);
    return cors(httpError(500, "Unable to load weather info. Please try again."));
  }
}
