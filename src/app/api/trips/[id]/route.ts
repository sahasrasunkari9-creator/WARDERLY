import { NextResponse } from "next/server";
import { clientIp, cors, httpError, notFound, preflight, rateLimit } from "@/server/lib/http";
import { deleteTrip, getTrip } from "@/server/services/tripStore";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function OPTIONS() {
  return preflight();
}

/** GET /api/trips/:id */
export async function GET(req: Request, { params }: Params) {
  const ip = clientIp(req);
  if (!rateLimit(`gettrip:${ip}`, 120, 60_000)) {
    return cors(httpError(429, "Too many requests. Please slow down."));
  }
  const { id } = await params;
  try {
    const trip = await getTrip(id);
    if (!trip) return cors(notFound("Trip"));
    return cors(NextResponse.json({ success: true, trip }));
  } catch (e) {
    console.error("[GET /api/trips/:id]", e);
    return cors(httpError(500, "We couldn't load this trip. Please try again."));
  }
}

/** DELETE /api/trips/:id */
export async function DELETE(req: Request, { params }: Params) {
  const ip = clientIp(req);
  if (!rateLimit(`deltrip:${ip}`, 20, 60_000)) {
    return cors(httpError(429, "Too many requests. Please slow down."));
  }
  const { id } = await params;
  try {
    const deleted = await deleteTrip(id);
    if (!deleted) return cors(notFound("Trip"));
    return cors(NextResponse.json({ success: true, deleted: id }));
  } catch (e) {
    console.error("[DELETE /api/trips/:id]", e);
    return cors(httpError(500, "We couldn't delete this trip. Please try again."));
  }
}
