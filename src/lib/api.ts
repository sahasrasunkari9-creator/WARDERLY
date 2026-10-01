import type {
  AssistantReply,
  DestinationInfo,
  GeneratedTrip,
  Recommendation,
  TripRequest,
  TripRow,
  WeatherSample,
} from "./travelTypes";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parse(res: Response) {
  let body: { success?: boolean; error?: string } & Record<string, unknown>;
  try {
    body = await res.json();
  } catch {
    throw new ApiError("The server returned an unexpected response.", res.status);
  }
  if (!res.ok || body.success === false) {
    throw new ApiError(body.error ?? "Something went wrong.", res.status);
  }
  return body;
}

const BASE = "/api";

export const api = {
  async listDestinations(): Promise<DestinationInfo[]> {
    const body = await parse(await fetch(`${BASE}/destinations`));
    return body.destinations as DestinationInfo[];
  },

  async recommend(prefs: {
    budgetLevel: string;
    interests: string[];
    season: string;
    days: number;
    region: string;
  }): Promise<Recommendation[]> {
    const body = await parse(
      await fetch(`${BASE}/destinations/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      })
    );
    return body.recommendations as Recommendation[];
  },

  async generateTrip(req: TripRequest): Promise<GeneratedTrip> {
    const body = await parse(
      await fetch(`${BASE}/trips/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      })
    );
    return body.trip as GeneratedTrip;
  },

  async saveTrip(trip: GeneratedTrip): Promise<TripRow> {
    const body = await parse(
      await fetch(`${BASE}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip),
      })
    );
    return body.trip as TripRow;
  },

  async listTrips(): Promise<TripRow[]> {
    const body = await parse(await fetch(`${BASE}/trips`));
    return body.trips as TripRow[];
  },

  async getTrip(id: string): Promise<TripRow> {
    const body = await parse(await fetch(`${BASE}/trips/${id}`));
    return body.trip as TripRow;
  },

  async deleteTrip(id: string): Promise<void> {
    await parse(await fetch(`${BASE}/trips/${id}`, { method: "DELETE" }));
  },

  async weather(destination: string): Promise<WeatherSample> {
    const body = await parse(await fetch(`${BASE}/weather?dest=${encodeURIComponent(destination)}`));
    return body.weather as WeatherSample;
  },

  async askAssistant(message: string, context?: Record<string, unknown>): Promise<AssistantReply> {
    const body = await parse(
      await fetch(`${BASE}/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context }),
      })
    );
    return body.reply as AssistantReply;
  },
};

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status >= 500 || e.status === 0) {
      return "Unable to connect to the server. Please try again.";
    }
    return e.message;
  }
  if (e instanceof TypeError) {
    return "Unable to connect to the server. Please try again.";
  }
  return "Something went wrong. Please try again.";
}
