import { NextResponse } from "next/server";
import { cors, preflight } from "@/server/lib/http";
import { DESTINATIONS } from "@/server/ai";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
}

/** GET /api/destinations — the curated destination catalog. */
export async function GET() {
  return cors(NextResponse.json({ success: true, destinations: DESTINATIONS }));
}
