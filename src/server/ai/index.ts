import type {
  AssistantReply,
  GeneratedTrip,
  Recommendation,
  TripRequest,
  WeatherSample,
} from "@/lib/travelTypes";
import {
  assistantReply,
  DESTINATIONS,
  destinationById,
  generateTrip,
  packingList,
  recommendDestinations,
  sampleWeather,
} from "./travelEngine";

/** "ai" when a live LLM produced the output, "demo" for the rule-based engine. */
export function aiProviderConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

/**
 * AI Travel Service.
 * Default: clearly-labeled demo engine (rule-based itineraries, budgets,
 * assistant). With AI_API_KEY configured, trip generation can be produced
 * by a live model — any failure falls back to the demo engine.
 */

async function tryRemoteTrip(req: TripRequest): Promise<GeneratedTrip | null> {
  const key = process.env.AI_API_KEY;
  if (!key) return null;
  const base = (process.env.AI_API_BASE ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.6,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a travel planner. Return ONLY JSON: " +
              '{"title","destination","destinations":[],"days","travelers","style","interests":[],"season","currency":"USD","totalBudget":number,' +
              '"itinerary":[{"day","title","morning","afternoon","evening","tip"}],"budgetBreakdown":{category:amount},' +
              '"packing":[],"tips":[]}. Label all prices as estimates in tips. Never invent verified live prices.',
          },
          { role: "user", content: JSON.stringify(req) },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = JSON.parse(data.choices?.[0]?.message?.content ?? "null") as Record<string, unknown>;
    if (!Array.isArray(raw.itinerary) || typeof raw.totalBudget !== "number") return null;
    const demo = generateTrip(req);
    return { ...demo, ...raw, mode: "ai" } as GeneratedTrip;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function runTripGeneration(req: TripRequest): Promise<GeneratedTrip> {
  const remote = await tryRemoteTrip(req);
  if (remote) return remote;
  await new Promise((r) => setTimeout(r, 400));
  return generateTrip(req);
}

export function runAssistant(message: string, context?: Record<string, unknown>): AssistantReply {
  return assistantReply(message, context);
}

export { DESTINATIONS, destinationById, recommendDestinations, sampleWeather, packingList };

export type { GeneratedTrip, Recommendation, TripRequest, WeatherSample };
