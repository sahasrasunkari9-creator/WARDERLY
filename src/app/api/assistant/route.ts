import { NextResponse } from "next/server";
import { clientIp, cors, httpError, preflight, rateLimit, strField } from "@/server/lib/http";
import { runAssistant } from "@/server/ai";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return preflight();
}

/** POST /api/assistant — the demo AI travel assistant. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`assistant:${ip}`, 20, 60_000)) {
    return cors(httpError(429, "You're asking a lot of questions fast. Give it a minute."));
  }
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return cors(httpError(400, "Request body must be valid JSON."));
  }
  const message = strField(body, "message", { max: 600 });
  if (message.length < 2) {
    return cors(httpError(400, "Please type a question for the assistant."));
  }
  try {
    const reply = runAssistant(message, body.context as Record<string, unknown> | undefined);
    return cors(NextResponse.json({ success: true, reply }));
  } catch (e) {
    console.error("[POST /api/assistant]", e);
    return cors(httpError(500, "The assistant is unavailable right now. Please try again."));
  }
}
