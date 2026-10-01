import type {
  AssistantReply,
  DestinationInfo,
  GeneratedTrip,
  ItineraryDay,
  Recommendation,
  Season,
  TripRequest,
  TravelStyle,
  WeatherSample,
} from "@/lib/travelTypes";

/**
 * Rule-based travel engine (Demo Mode).
 * Itineraries, budgets and packing lists are generated from curated
 * destination data; all prices are clearly labeled estimates.
 */

/* ------------------------- Destination catalog ------------------------ */

const IMG = {
  bali: "https://images.pexels.com/photos/35428411/pexels-photo-35428411.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  paris: "https://images.pexels.com/photos/16823628/pexels-photo-16823628.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  tokyo: "https://images.pexels.com/photos/16789398/pexels-photo-16789398.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  santorini: "https://images.pexels.com/photos/18774878/pexels-photo-18774878.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  jaipur: "https://images.pexels.com/photos/19149607/pexels-photo-19149607.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  kerala: "https://images.pexels.com/photos/12950219/pexels-photo-12950219.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  alps: "https://images.pexels.com/photos/37713450/pexels-photo-37713450.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  dubai: "https://images.pexels.com/photos/19664340/pexels-photo-19664340.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

export const DESTINATIONS: DestinationInfo[] = [
  {
    id: "bali", name: "Bali", country: "Indonesia", region: "International", image: IMG.bali, imageCredit: "Tom Fisk / Pexels",
    vibe: "Tropical temples, rice terraces and beach sunsets",
    lat: -8.4095, lng: 115.1889,
    dailyBudgetLow: 30, dailyBudgetHigh: 90,
    bestMonths: "Apr–Oct (dry season)",
    tags: ["Beaches", "Nature & Wildlife", "Wellness", "Culture & Heritage", "Food"],
    attractions: ["Uluwatu Temple", "Tegallalang Rice Terraces", "Tanah Lot", "Ubud Monkey Forest", "Nusa Penida day trip"],
    food: ["Nasi Goreng", "Babi Guling", "Sate Lilit", "Smoothie bowls in Ubud"],
    activities: ["Surfing at Kuta/Kuta Beach", "Trekking Mount Batur at sunrise", "Yoga retreats", "Snorkeling at Amed"],
    culture: ["Balinese temple ceremonies", "Traditional dance shows in Ubud", "Silver-smithing in Celuk"],
    hotelHint: "Ubud villas for culture, Seminyak for beach-club energy, Amed for quiet stays.",
    transportHint: "Rent a scooter or hire a private driver for day trips — far easier than public transport.",
    monthlyTempC: [29, 29, 29, 29, 28, 28, 28, 28, 28, 28, 28, 29],
    monthlyRainMm: [170, 180, 160, 160, 110, 80, 30, 30, 40, 70, 100, 150],
  },
  {
    id: "paris", name: "Paris", country: "France", region: "International", image: IMG.paris, imageCredit: "Josh Withers / Pexels",
    vibe: "Art, cafés and golden-hour boulevards",
    lat: 48.8566, lng: 2.3522,
    dailyBudgetLow: 90, dailyBudgetHigh: 260,
    bestMonths: "Apr–Jun & Sep–Oct",
    tags: ["Culture & Heritage", "Food", "Romantic", "Shopping", "Nightlife"],
    attractions: ["Eiffel Tower", "Louvre Museum", "Montmartre", "Notre-Dame", "Seine river cruise"],
    food: ["Croissants from a proper boulangerie", "Steak frites", "Crêpes in Montmartre", "Cheese plate & wine"],
    activities: ["Day trip to Versailles", "Canal-side cycling", "Jazz cellars in Saint-Germain", "Museum night tickets"],
    culture: ["Impressionist galleries in Musée d'Orsay", "Market mornings at Marché des Enfants Rouges", "Sunday picnic in Luxembourg gardens"],
    hotelHint: "Stay in the 1st–4th or 11th arrondissements for walkability and metro access.",
    transportHint: "Metro + RER cover everything; get a Navigo Easy card and buy t+ tickets.",
    monthlyTempC: [7, 8, 11, 14, 17, 19, 21, 21, 18, 13, 9, 7],
    monthlyRainMm: [51, 41, 48, 44, 53, 48, 47, 52, 48, 62, 50, 53],
  },
  {
    id: "tokyo", name: "Tokyo", country: "Japan", region: "International", image: IMG.tokyo, imageCredit: "Alan W / Pexels",
    vibe: "Neon streets, precise trains and world-class food",
    lat: 35.6762, lng: 139.6503,
    dailyBudgetLow: 60, dailyBudgetHigh: 200,
    bestMonths: "Mar–May & Oct–Nov",
    tags: ["Culture & Heritage", "Food", "Nightlife", "Shopping", "Nature & Wildlife"],
    attractions: ["Shibuya Crossing", "Senso-ji Temple", "TeamLab Planets", "Meiji Shrine", "Tokyo Tower"],
    food: ["Ramen in Shinjuku", "Sushi at Tsukishima market", "Izakaya dinners", "Conbini snacks"],
    activities: ["Day trip to Mt. Fuji / Hakone", "Cherry blossom hanami (spring)", "Akihabara arcades", "Sumo morning practice (seasonal)"],
    culture: ["Tea ceremony in Gion, Kyoto day trip", "Traditional craft shops in Asakusa", "Shrine rituals at Meiji"],
    hotelHint: "Shinjuku or Shinjuku-Ku for transit hubs; Asakusa for a traditional feel.",
    transportHint: "Suica/Pasmo card for trains and buses; the Yamanote Line loop covers most sights.",
    monthlyTempC: [6, 7, 10, 15, 19, 22, 26, 27, 23, 18, 12, 8],
    monthlyRainMm: [52, 56, 118, 125, 138, 168, 154, 168, 210, 198, 93, 51],
  },
  {
    id: "santorini", name: "Santorini", country: "Greece", region: "International", image: IMG.santorini, imageCredit: "AXP Photography / Pexels",
    vibe: "Cliffside white villages over a caldera of blue",
    lat: 36.3932, lng: 25.4615,
    dailyBudgetLow: 80, dailyBudgetHigh: 240,
    bestMonths: "May–Oct",
    tags: ["Beaches", "Romantic", "Food", "Culture & Heritage"],
    attractions: ["Oia sunset viewpoint", "Caldera rim walk", "Red Beach", "Akrotiri ruins", "Santo Wineries"],
    food: ["Fava dip", "Tomato fritters", "Grilled octopus", "Assyrtiko wine tastings"],
    activities: ["Catamaran caldera cruise", "Hike Fira→Oia (10 km)", "Volcanic hot springs swim", "Sunset sailing"],
    culture: ["Akrotiri's Minoan ruins", "Villages of Pyrgos & Megalochori", "Local cheese and honey producers"],
    hotelHint: "Fira for nightlife and views; Imerovigli for quieter caldera-edge stays.",
    transportHint: "Local buses are cheap; rent an ATV or car for beaches and wineries at your own pace.",
    monthlyTempC: [14, 14, 16, 19, 23, 26, 28, 28, 26, 23, 19, 15],
    monthlyRainMm: [45, 30, 25, 15, 8, 4, 2, 2, 5, 15, 35, 50],
  },
  {
    id: "jaipur", name: "Jaipur", country: "India", region: "India", image: IMG.jaipur, imageCredit: "AXP Photography / Pexels",
    vibe: "The Pink City — forts, bazaars and royal history",
    lat: 26.9124, lng: 75.7873,
    dailyBudgetLow: 20, dailyBudgetHigh: 70,
    bestMonths: "Oct–Mar",
    tags: ["Culture & Heritage", "Food", "Shopping"],
    attractions: ["Hawa Mahal", "Amber Fort", "City Palace", "Jantar Mantar", "Nahargarh sunset"],
    food: ["Dal Baati Churma", "Pyaz Kachori", "Laal Maas", "Sweet mithai in Johari Bazaar"],
    activities: ["Elephant-free jeep ride at Amber", "Block-print workshop", "Hot-air balloon at sunrise (seasonal)", "Bazaar treasure hunt"],
    culture: ["Jaipuri miniatures & pottery", "Folk dance at a haveli", "Evening aarti at Gatore ki Havan"],
    hotelHint: "Heritage havelis near City Palace for the full experience; Central for value.",
    transportHint: "Airport is close; auto-rickshaws and prepaid cabs handle the city. Day trips to Ajmer/Fatehpur Sikri by car.",
    monthlyTempC: [14, 18, 25, 31, 34, 33, 30, 29, 28, 26, 19, 15],
    monthlyRainMm: [20, 15, 10, 15, 30, 75, 155, 110, 60, 30, 15, 20],
  },
  {
    id: "kerala", name: "Kerala", country: "India", region: "India", image: IMG.kerala, imageCredit: "Nishad Mohammed / Pexels",
    vibe: "Backwaters, tea hills and Ayurvedic calm",
    lat: 9.4981, lng: 76.3388,
    dailyBudgetLow: 25, dailyBudgetHigh: 90,
    bestMonths: "Sep–May",
    tags: ["Nature & Wildlife", "Wellness", "Family", "Food"],
    attractions: ["Alappuzha houseboats", "Munnar tea gardens", "Kochi Fort", "Varkala cliffs", "Periyar wildlife"],
    food: ["Kerala Sadya feast", "Appam & Stew", "Karimeen fry", "Filter coffee"],
    activities: ["Two-night houseboat cruise", "Waterfalls trek in Munnar", "Ayurveda day spa", "Kalaripayattu demo"],
    culture: ["Kathakali evening performance", "Coir and spice markets in Kochi", "Village homestay meals"],
    hotelHint: "Houseboat for Alappuzha, tea-garden resorts for Munnar, cliff resorts for Varkala.",
    transportHint: "Hire a cab for Kochi→Munnar→Alappuzha route; local autos for short hops.",
    monthlyTempC: [30, 31, 32, 32, 31, 30, 29, 29, 29, 30, 29, 29],
    monthlyRainMm: [340, 340, 240, 160, 110, 60, 150, 260, 320, 460, 400, 380],
  },
  {
    id: "alps", name: "Swiss Alps (Interlaken)", country: "Switzerland", region: "International", image: IMG.alps, imageCredit: "Parth Patel / Pexels",
    vibe: "Glacier peaks, green meadows and slow scenic trains",
    lat: 46.6863, lng: 7.8632,
    dailyBudgetLow: 130, dailyBudgetHigh: 320,
    bestMonths: "Jun–Sep & Dec–Feb (ski)",
    tags: ["Mountains", "Adventure", "Nature & Wildlife"],
    attractions: ["Jungfraujoch 'Top of Europe'", "Lake Brienz cruise", "Harder Kulm viewpoint", "Grindelwald First", "Lauterbrunnen valley"],
    food: ["Fondue in a mountain hut", "Rösti", "Appenzeler cheese", "Baked goods with alpine views"],
    activities: ["Paragliding over Interlaken", "Hiking the Eiger trail", "Skiing (winter)", "Canyoning in summer"],
    culture: ["Alphorn player evenings in villages", "Cheese-making farm visits", "Swiss precision: scenic railways"],
    hotelHint: "Interlaken for transit; Grindelwald or Mürren for valley-view rooms.",
    transportHint: "Swiss Travel Pass pays off for trains + boats + mountain railways.",
    monthlyTempC: [0, 2, 7, 9, 13, 16, 18, 18, 14, 10, 5, 1],
    monthlyRainMm: [60, 55, 75, 85, 95, 110, 105, 110, 90, 85, 70, 65],
  },
  {
    id: "dubai", name: "Dubai", country: "UAE", region: "International", image: IMG.dubai, imageCredit: "aboodi vesakaran / Pexels",
    vibe: "Futuristic skyline, desert dunes and luxury everything",
    lat: 25.2048, lng: 55.2708,
    dailyBudgetLow: 70, dailyBudgetHigh: 280,
    bestMonths: "Nov–Mar",
    tags: ["Shopping", "Luxury", "Family", "Nightlife"],
    attractions: ["Burj Khalifa", "Dubai Mall & fountain show", "Palm Jumeirah", "Desert safari", "Old Dubai souks"],
    food: ["Shawarma done right", "Camel-mint tea", "Brunch culture", "Fine dining at Atlas/ATLAS"],
    activities: ["Dune-bashing safari with BBQ", "Indoor ski & ice rinks", "Abseil Burj Khalifa (Nov–Apr)", "Dhow cruise on the Creek"],
    culture: ["Al Fahidi historic district", "Gold & spice souks by abra boat", "Frankincense markets"],
    hotelHint: "Downtown for Burj views; Palm for resorts; Deira for budget near souks.",
    transportHint: "Metro is excellent; taxis/ride-hailing are cheap; abra boats cross the Creek.",
    monthlyTempC: [19, 21, 24, 29, 33, 36, 36, 36, 34, 31, 27, 21],
    monthlyRainMm: [25, 20, 10, 5, 3, 1, 1, 1, 1, 3, 10, 20],
  },
];

export function destinationById(id: string): DestinationInfo | undefined {
  return DESTINATIONS.find((d) => d.id === id || d.name.toLowerCase() === id.toLowerCase());
}

/* --------------------------- Recommendations -------------------------- */

export function recommendDestinations(prefs: {
  budgetLevel: string; // "budget" | "mid" | "luxury"
  interests: string[];
  season: string;
  days: number;
  region: string; // "India" | "International" | "Any"
}): Recommendation[] {
  const month = new Date().getMonth(); // 0-based
  const out: Recommendation[] = [];
  for (const d of DESTINATIONS) {
    if (prefs.region !== "Any" && d.region !== prefs.region) continue;
    let score = 50;
    const reasons: string[] = [];

    // budget fit (estimates)
    const mid = (d.dailyBudgetLow + d.dailyBudgetHigh) / 2;
    if (prefs.budgetLevel === "budget" && d.dailyBudgetLow <= 35) {
      score += 22;
      reasons.push(`Fits a budget trip (~$${d.dailyBudgetLow}/day local spend, est.)`);
    } else if (prefs.budgetLevel === "mid" && mid >= 50 && mid <= 160) {
      score += 18;
      reasons.push(`Mid-range friendly (~$${Math.round(mid)}/day est.)`);
    } else if (prefs.budgetLevel === "luxury" && d.dailyBudgetHigh >= 200) {
      score += 16;
      reasons.push(`Strong luxury options available`);
    } else {
      score -= 12;
    }

    // interests
    const hits = prefs.interests.filter((i) => d.tags.includes(i));
    score += hits.length * 10;
    if (hits.length) reasons.push(`Matches: ${hits.slice(0, 2).join(", ")}`);

    // season: prefer months with lower rain & mild temp
    const temp = d.monthlyTempC[month];
    const rain = d.monthlyRainMm[month];
    if (rain < 80 && temp >= 14 && temp <= 32) {
      score += 14;
      reasons.push("Favorable sample climate this month");
    } else if (rain > 300) {
      score -= 10;
    }

    // duration fit
    if (prefs.days >= 5 && (d.id === "kerala" || d.id === "alps" || d.id === "bali")) {
      score += 6;
      reasons.push("Great for longer, multi-region itineraries");
    }

    if (score >= 45) out.push({ destination: d, matchScore: Math.min(98, score), reasons: reasons.slice(0, 3) });
  }
  return out.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
}

/* ----------------------------- Trip generator ------------------------- */

const STYLE_FLAVOR: Record<TravelStyle, { stay: string; pace: string; splurge: string; tone: string }> = {
  Adventure: { stay: "a lodge with early-morning start facilities", pace: "packed", splurge: "a guided trek or adventure activity", tone: "energetic" },
  Luxury: { stay: "a 4–5★ property with premium service", pace: "unhurried", splurge: "a signature dining experience or private tour", tone: "polished" },
  Family: { stay: "a family-friendly resort with pools and kids' facilities", pace: "relaxed", splurge: "one show or theme-park day", tone: "warm" },
  Solo: { stay: "a central guesthouse or boutique hotel", pace: "flexible", splurge: "a local food market crawl", tone: "independent" },
  Romantic: { stay: "a boutique hotel with a view", pace: "slow", splurge: "a candlelit dinner with a view", tone: "intimate" },
  Budget: { stay: "a well-reviewed hostel or budget hotel", pace: "efficient", splurge: "one treated meal", tone: "thrifty" },
};

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function generateTrip(req: TripRequest): GeneratedTrip {
  const seed = hash(req.destination + req.days + req.style + String(Date.now() / 6e4));
  const rnd = mulberry(seed);
  const dests = req.destinations.map((d) => destinationById(d)).filter((d): d is DestinationInfo => Boolean(d));
  const primary = dests[0] ?? destinationById(req.destination) ?? DESTINATIONS[0];
  const multi = dests.length > 1;
  const flavor = STYLE_FLAVOR[req.style];
  const days = Math.min(Math.max(req.days, 2), 14);

  const daySplit = dests.map((_, i) => {
    const base = Math.floor(days / dests.length);
    return base + (i < days % dests.length ? 1 : 0);
  });

  /* ---- itinerary ---- */
  const itinerary: ItineraryDay[] = [];
  let day = 1;
  dests.forEach((d, di) => {
    const n = daySplit[di];
    const att = d.attractions;
    const acts = d.activities;
    for (let i = 0; i < n; i++) {
      const a1 = att[i % att.length];
      const a2 = att[(i + 2) % att.length];
      const a3 = acts[i % acts.length];
      let title: string;
      if (multi && i === 0) title = `Arrive in ${d.name}`;
      else if (i === n - 1 && di === dests.length - 1) title = `Farewell ${d.name}`;
      else if (i === n - 1 && di < dests.length - 1) title = `Travel to ${dests[di + 1].name}`;
      else title = `${d.name}, day ${i + 1} — ${flavor.tone} pace`;

      const morning =
        i === 0 && di === 0
          ? `Check in at your ${flavor.stay.split(" ").slice(0, 3).join(" ")} area stay; light walk around the neighborhood and a slow breakfast.`
          : i === n - 1 && di < dests.length - 1
            ? `Checkout and transfer to ${dests[di + 1].name} (allow buffer for delays). Evening: easy dinner near your next stay.`
            : `Head to ${a1} early to beat the crowds; allow extra time if you like to photograph.`;
      const afternoon =
        i === 0
          ? `Settle in, then ${a3.toLowerCase()} or a relaxed local stroll to learn the neighborhood.`
          : `Visit ${a2}; pair it with a local lunch (try ${d.food[i % d.food.length]}).`;
      const evening =
        i === n - 1 && di === dests.length - 1
          ? `A slow final evening: ${d.food[(i + 1) % d.food.length]} near the center, pack, and plan the return.`
          : i === n - 1
            ? `Evening at ease — a local ${d.culture[i % d.culture.length].toLowerCase()} or a sunset spot nearby.`
            : `Evening: ${d.culture[i % d.culture.length].toLowerCase()}; keep a buffer for delays.`;

      const tips = [
        `Book ${a1} tickets online in advance.`,
        `Carry small change and a copy of your booking confirmations offline.`,
        `Recharge your transport card before morning sightseeing.`,
        `Stay hydrated and plan a rest window mid-afternoon.`,
        `Ask your hotel for their honest local recommendation — they know the shortcuts.`,
      ];
      itinerary.push({
        day: day++,
        title,
        morning,
        afternoon,
        evening,
        tip: tips[Math.floor(rnd() * tips.length)],
      });
    }
  });

  /* ---- budget (ESTIMATES, USD) ---- */
  const travelers = Math.max(1, Math.min(10, req.travelers));
  const localMid = (primary.dailyBudgetLow + primary.dailyBudgetHigh) / 2;
  const styleMult = req.style === "Luxury" ? 2.1 : req.style === "Budget" ? 0.6 : req.style === "Romantic" ? 1.3 : 1;
  const localDaily = Math.round(localMid * styleMult);
  const accommodation = Math.round(localDaily * 0.45 * days * travelers * 0.5); // room shared factor
  const flights = multi ? 380 : 240; // per person one-way est. ×2
  const transport = Math.round(days * 22 * Math.min(travelers, 4) * (multi ? 1.3 : 1));
  const food = Math.round(days * Math.round(localDaily * 0.32) * travelers * 0.55);
  const activities = Math.round(days * 28 * travelers * (req.style === "Luxury" ? 1.8 : 1));
  const shopping = Math.round(120 * travelers * (req.style === "Luxury" ? 1.6 : 0.8));
  let total = accommodation + flights * 2 * travelers + transport + food + activities + shopping;
  // Scale to fit user's budget if provided
  const budget = Math.max(0, Math.round(req.totalBudget));
  let breakdown: Record<string, number>;
  if (budget > 0 && total > 0 && Math.abs(budget - total) / total > 0.08) {
    const factor = budget / total;
    const scale = (n: number) => Math.round(n * factor);
    total = budget;
    breakdown = {
      Accommodation: scale(accommodation),
      "Flights (round trip, est.)": scale(flights * 2 * travelers),
      "Local transport": scale(transport),
      "Food & drinks": scale(food),
      "Activities & sightseeing": scale(activities),
      Shopping: scale(shopping),
    };
  } else {
    total = budget > 0 ? budget : total;
    breakdown = {
      Accommodation: accommodation,
      "Flights (round trip, est.)": flights * 2 * travelers,
      "Local transport": transport,
      "Food & drinks": food,
      "Activities & sightseeing": activities,
      Shopping: shopping,
    };
  }

  /* ---- packing ---- */
  const base = ["Passport / ID (valid 6+ months)", "Travel insurance documents", "Chargers + universal adapter", "Medication + basic first-aid"];
  const month = new Date().getMonth();
  const temp = primary.monthlyTempC[month];
  const rain = primary.monthlyRainMm[month];
  if (temp > 28) base.push("Light breathable clothing (sample climate: hot)", "Sunscreen SPF 50 + hat", "Swimwear");
  else if (temp >= 16) base.push("Layered clothing (sample climate: mild)", "Light rain jacket");
  else base.push("Warm layers + insulated jacket (sample climate: cold)", "Gloves, beanie, thermal insoles");
  if (rain > 120) base.push("Compact umbrella + quick-dry jacket (sample climate: rainy)", "Waterproof shoe covers");
  if (req.days >= 5) base.push("Reusables: bottle, bag, to-go mug", "Portable power bank (10,000 mAh+)");
  if (primary.tags.includes("Adventure")) base.push("Sturdy walking shoes", "Daypack with rain cover");
  if (primary.tags.includes("Wellness")) base.push("Yoga mat (thin, roll-up)");
  if (primary.id === "dubai") base.push("Modest attire for mosques/souks", "Comfortable closed shoes for desert safari");
  if (primary.id === "alps") base.push("Hiking boots + poles", "Sunglasses (UV) + sun hat");

  /* ---- tips ---- */
  const tips = [
    `All prices are estimates in USD for planning only — verify live prices before booking.`,
    `Weather shown is sample climate data, not a live forecast.`,
    `Use ${primary.transportHint}`,
    `Stay strategy: ${primary.hotelHint}`,
    req.style === "Budget" ? "Book transport 2–4 weeks ahead and travel mid-week for the best fares (est.)." : `Budget splurge: ${flavor.splurge} — one treat per trip keeps energy high.`,
    "Keep offline maps and a paper backup of your itinerary — phone batteries die at the worst times.",
  ];

  const title = `${primary.name}${multi ? ` + ${dests.length - 1}` : ""} · ${days} days · ${req.style}`;

  return {
    title,
    destination: primary.name,
    destinations: dests.map((d) => d.name),
    days,
    travelers,
    style: req.style,
    interests: req.interests,
    season: req.season,
    currency: "USD",
    totalBudget: total,
    itinerary,
    budgetBreakdown: breakdown,
    packing: base,
    tips,
    mode: "demo",
  };
}

/* ------------------------------ Packing solo -------------------------- */

export function packingList(destId: string, season: string, days: number): string[] {
  const d = destinationById(destId) ?? DESTINATIONS[0];
  const month = new Date().getMonth();
  const temp = d.monthlyTempC[month];
  const rain = d.monthlyRainMm[month];
  const list: string[] = [];
  list.push("Passport / ID, travel insurance, offline maps");
  if (temp > 28) list.push("Hot: light clothing, SPF 50, hat, swimwear (sample climate)");
  else if (temp >= 16) list.push("Mild: layers + light rain jacket (sample climate)");
  else list.push("Cold: insulation, gloves, beanie (sample climate)");
  if (rain > 120) list.push("Rainy: umbrella, quick-dry jacket, waterproof covers");
  if (days >= 5) list.push("Longer trip: power bank, reusables, laundry plan");
  if (d.tags.includes("Adventure")) list.push("Adventure: sturdy shoes, daypack");
  list.push(d.id === "dubai" ? "Dubai: modest wear for mosques, closed shoes for desert" : d.hotelHint);
  return list;
}

/* --------------------------- Weather (sample) ------------------------- */

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function sampleWeather(destId: string): WeatherSample {
  const d = destinationById(destId) ?? DESTINATIONS[0];
  const month = new Date().getMonth();
  const temp = d.monthlyTempC[month];
  const rain = d.monthlyRainMm[month];
  const condition: WeatherSample["condition"] =
    temp <= 2 ? "Snow" : rain > 200 ? "Rainy" : temp > 31 ? "Humid" : rain > 90 ? "Mild" : "Sunny";
  const bestTime = d.bestMonths.includes(MONTH_NAMES[month].slice(0, 3)) || /Apr–Oct/.test(d.bestMonths) && month >= 3 && month <= 9;
  return {
    destination: d.name,
    month: MONTH_NAMES[month],
    tempC: temp,
    rainMm: rain,
    condition,
    bestTime: Boolean(bestTime),
    note: `Best time to visit: ${d.bestMonths}. Sample climate data — not a live forecast.`,
    labeled: "sample",
  };
}

/* --------------------------- Demo assistant --------------------------- */

const BUDGET_TIPS = [
  "Book flights 3–8 weeks ahead for domestic, 2–4 months for international (est. savings 15–30%).",
  "Travel mid-week (Tue–Wed) — fares are often cheaper than weekends.",
  "Eat like a local: street food and local cafés cost a fraction of tourist restaurants.",
  "Use public transport cards instead of taxis for daily sightseeing.",
  "Check for city tourist passes — they pay off from day 2 if you'll do 3+ paid attractions.",
];

function assistantReply(message: string, context?: Record<string, unknown>): AssistantReply {
  const m = message.toLowerCase();
  const mode: AssistantReply["mode"] = "demo";

  if (/^(hi|hello|hey)\b/.test(m)) {
    return {
      text: "Hi! I'm your travel assistant (demo mode — predefined guidance, not a live AI). Ask me about destinations, budgets, packing, itineraries or travel tips.",
      followUps: ["Best destinations this season?", "How do I save money on flights?", "What should I pack for Bali?"],
      mode,
    };
  }
  if (/pack|lugg|bag/.test(m)) {
    const d = context?.destination ? destinationById(String(context.destination)) : undefined;
    const dest = d?.name ?? "your destination";
    return {
      text: `Packing for ${dest} (demo checklist):\n• Passport/ID + insurance docs + offline maps\n• Clothing for the season — check the Insights tab for sample climate\n• Comfortable walking shoes (you'll walk far more than you plan)\n• Power bank + adapters, a reusable bottle, a small first-aid kit\n• One 'nice outfit' — you'll thank yourself at dinner\nFull lists are generated per trip in the Planner.`,
      followUps: ["What's the best time to visit?", "Budget tips?", "Build my itinerary"],
      mode,
    };
  }
  if (/budget|cheap|save|money|cost|price|expense/.test(m)) {
    return {
      text: `Smart budget moves (demo tips, all prices are estimates):\n${BUDGET_TIPS.slice(0, 4).map((t) => `• ${t}`).join("\n")}\n\nRule of thumb: split your budget ~40% stay / 25% food / 20% activities / 10% transport / 5% buffer, then adjust per destination.`,
      followUps: ["Where can I go on a budget?", "Plan a budget trip", "Best destinations this season?"],
      mode,
    };
  }
  if (/best time|when to|season|weather|month/.test(m)) {
    const d = context?.destination ? destinationById(String(context.destination)) : undefined;
    return {
      text: d
        ? `Best time for ${d.name}: ${d.bestMonths}. Sample climate right now: ~${d.monthlyTempC[new Date().getMonth()]}°C with ${d.monthlyRainMm[new Date().getMonth()]} mm typical rain — that's sample data, check the Insights tab for the full month. `
        : `Best time depends on the destination: Bali Apr–Oct, Paris Apr–Jun/Sep–Oct, Tokyo Mar–May/Oct–Nov, Jaipur Oct–Mar, Kerala Sep–May, Swiss Alps Jun–Sep (or Dec–Feb for ski), Dubai Nov–Mar. (Sample climate guidance.)`,
      followUps: ["Recommend a destination", "What should I pack?", "Plan my trip"],
      mode,
    };
  }
  if (/recommend|where to|suggest|destination|where should/.test(m)) {
    return {
      text: `Based on the current sample climate (demo recommendations):
• Bali — dry, warm, great value (~$30–90/day est.)
• Tokyo — pleasant if it's Mar–May or Oct–Nov
• Jaipur — wonderful Oct–Mar, excellent value in India
• Santorini — perfect May–Oct, romantic and photogenic
• Kerala — best Sep–May for backwaters and hills
Tell me your budget and interests, or open the Destination Finder for scored picks.`,
      followUps: ["Budget trip ideas", "Luxury options?", "Family-friendly places?"],
      mode,
    };
  }
  if (/visa|document|passport/.test(m)) {
    return {
      text: "Travel documents (demo guidance — always verify official requirements): passport valid 6+ months beyond your trip, visa per destination rules, travel insurance (medical + cancellation), hotel bookings and return-ticket proof for some countries. India destinations need no visa for Indian citizens; International trips vary — check your embassy/consulate site.",
      followUps: ["Best destinations this season?", "Budget tips?"],
      mode,
    };
  }
  if (/safe|safety|scam|tourist trap/.test(m)) {
    return {
      text: "Staying safe (demo tips): use official taxi apps or prepaid counters, keep digital + paper copies of documents, don't wear flashy valuables, learn 5 phrases in the local language, book attractions from official sites, and trust your instincts — if a deal feels off, it is. All our pricing is estimates, so 'too good' prices online deserve extra caution.",
      followUps: ["Budget tips?", "What should I pack?"],
      mode,
    };
  }
  if (/itinerar|plan|trip|schedule|day/.test(m)) {
    return {
      text: "I can shape your trip into a day-by-day plan: pick destination(s) (up to 3), days, travelers, style (adventure/luxury/family/solo/romantic/budget) and total budget in the Planner — I'll generate an itinerary, a budget breakdown (estimates) and a packing list you can save to your dashboard.",
      followUps: ["Open the planner", "Best destinations this season?"],
      mode,
    };
  }
  return {
    text: "I can help with destinations, budgets, packing, best times to visit, itineraries, visas and safety (demo-mode guidance). Try one of the suggestions below, or open the Planner to build a full trip.",
    followUps: ["Best destinations this season?", "How do I save money?", "What should I pack?"],
    mode,
  };
}

export { assistantReply };
