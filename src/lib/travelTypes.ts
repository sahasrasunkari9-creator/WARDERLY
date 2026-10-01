export const TRAVEL_STYLES = ["Adventure", "Luxury", "Family", "Solo", "Romantic", "Budget"] as const;
export type TravelStyle = (typeof TRAVEL_STYLES)[number];

export const INTERESTS = [
  "Beaches",
  "Mountains",
  "Culture & Heritage",
  "Food",
  "Nightlife",
  "Nature & Wildlife",
  "Shopping",
  "Wellness",
] as const;
export type Interest = (typeof INTERESTS)[number];

export const SEASONS = ["Summer (Jun–Aug)", "Monsoon (Jul–Sep)", "Autumn (Sep–Nov)", "Winter (Dec–Feb)", "Spring (Mar–May)"] as const;
export type Season = (typeof SEASONS)[number];

export type GenerationMode = "ai" | "demo";

export interface DestinationInfo {
  id: string;
  name: string;
  country: string;
  region: "India" | "International";
  image: string;
  imageCredit: string;
  vibe: string;
  lat: number;
  lng: number;
  dailyBudgetLow: number; // USD per person per day, estimates
  dailyBudgetHigh: number;
  bestMonths: string;
  tags: string[];
  attractions: string[];
  food: string[];
  activities: string[];
  culture: string[];
  hotelHint: string;
  transportHint: string;
  monthlyTempC: number[]; // Jan..Dec (sample climate, clearly labeled)
  monthlyRainMm: number[];
}

export interface Recommendation {
  destination: DestinationInfo;
  matchScore: number;
  reasons: string[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  tip: string;
}

export interface TripRequest {
  destination: string;
  destinations: string[]; // multi-destination support (max 3)
  days: number;
  travelers: number;
  style: TravelStyle;
  interests: Interest[];
  season: Season;
  totalBudget: number; // USD, estimates only
}

export interface GeneratedTrip {
  title: string;
  destination: string;
  destinations: string[];
  days: number;
  travelers: number;
  style: TravelStyle;
  interests: Interest[];
  season: Season;
  currency: string;
  totalBudget: number;
  itinerary: ItineraryDay[];
  budgetBreakdown: Record<string, number>;
  packing: string[];
  tips: string[];
  mode: GenerationMode;
}

export interface TripRow {
  id: string;
  userId: string;
  title: string;
  destination: string;
  destinations: string[];
  days: number;
  travelers: number;
  style: string;
  interests: string[];
  season: string;
  totalBudget: number;
  currency: string;
  itinerary: ItineraryDay[];
  budgetBreakdown: Record<string, number>;
  packing: string[];
  tips: string[];
  generationMode: GenerationMode;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeatherSample {
  destination: string;
  month: string;
  tempC: number;
  rainMm: number;
  condition: "Sunny" | "Mild" | "Rainy" | "Snow" | "Humid";
  bestTime: boolean;
  note: string;
  labeled: "sample";
}

export interface AssistantReply {
  text: string;
  followUps: string[];
  mode: GenerationMode;
}
