export type AnyJson = Record<string, any>;

export type LottoCategory =
  | "pick3"
  | "pick4"
  | "jackpot"
  | "daily"
  | "other";

export type GeneratorMode = "hot" | "cold" | "balanced";

export interface LottoDraw {
  id: string;
  state: string;
  gameId?: string | number;
  gameName: string;
  drawDate: string;
  numbers: string[];
  bonusNumbers?: string[];
  category: LottoCategory;
  raw?: AnyJson;
}

export interface HistoricalInsights {
  totalDraws: number;
  digitFrequency: Record<string, number>;
  hotDigits: string[];
  coldDigits: string[];
  mostCommonPairs: { pair: string; count: number }[];
  lastSeen: Record<string, string>;
}

export interface TicketScannerHistoryResult {
  ticket: string[];
  appearedBefore: boolean;
  exactMatches: LottoDraw[];
  partialMatches: Array<{
    draw: LottoDraw;
    matchedNumbers: string[];
    matchedCount: number;
  }>;
}

export interface SequenceGeneratorResult {
  strategy: GeneratorMode;
  generated: string[];
  basedOnDraws: number;
  notes: string[];
}

export interface LiveDataBucket {
  pick3: LottoDraw[];
  pick4: LottoDraw[];
  jackpots: LottoDraw[];
  dailyGames: LottoDraw[];
  otherGames: LottoDraw[];
}

export interface LottoMindFeatureBundle {
  state: string;
  historyEnabled: boolean;
  liveData: LiveDataBucket;
  historyMenu: {
    available: boolean;
    pastDrawDates: string[];
    recentHistoricalDraws: LottoDraw[];
  };
  ticketScanner: TicketScannerHistoryResult | null;
  generator: SequenceGeneratorResult | null;
  lottoIntelligence: {
    locked: boolean;
    unlockCostCredits: number;
    historyPowerTool: HistoricalInsights | null;
  };
}

const RAPID_API_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || '0a08ea81c8mshecdfb0d3b1ba63cp1b01c5jsn18000f019b97';
const RAPID_API_HOST = "usa-lottery-result-all-state-api.p.rapidapi.com";
const API_BASE = `https://${RAPID_API_HOST}`;

export const LOTTO_ENDPOINTS = {
  pastDrawDates: (gameId: string | number) =>
    `/lottery-results/old/past-draws-dates?gameID=${gameId}`,

  historicalResultsByDate: (gameId: string | number, drawDate: string) =>
    `/lottery-results/old/past-draw-results?gameID=${gameId}&drawDate=${encodeURIComponent(drawDate)}`,

  currentPick3Pick4ByState: (state: string) =>
    `/lottery-results/live/pick3-pick4?state=${encodeURIComponent(state)}`,

  liveAllGamesByState: (state: string) =>
    `/lottery-results/live/all-games?state=${encodeURIComponent(state)}`,

  liveByState: (state: string) =>
    `/lottery-results/live/by-state?state=${encodeURIComponent(state)}`,
};

function ensureApiKey() {
  if (!RAPID_API_KEY) {
    throw new Error(
      "Missing EXPO_PUBLIC_RAPIDAPI_KEY in your Expo/Rork environment."
    );
  }
}

async function apiGet<T = any>(path: string): Promise<T> {
  ensureApiKey();

  console.log(`[LottoMindAPI] GET ${API_BASE}${path}`);

  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      "x-rapidapi-key": RAPID_API_KEY!,
      "x-rapidapi-host": RAPID_API_HOST,
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();

  if (!res.ok) {
    console.log(`[LottoMindAPI] Error ${res.status}: ${text}`);
    throw new Error(`LottoMind API ${res.status}: ${text || "Unknown error"}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

function asArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.results)) return value.results;
  if (Array.isArray(value.draws)) return value.draws;
  return [value];
}

function cleanString(value: any): string {
  return String(value ?? "").trim();
}

function normalizeNumbers(input: any): string[] {
  if (Array.isArray(input)) {
    return input.map((x) => cleanString(x)).filter(Boolean);
  }

  if (typeof input === "string") {
    const raw = input.trim();

    if (raw.includes(",") || raw.includes(" ") || raw.includes("-")) {
      return raw.split(/[,\s-]+/).map((x) => x.trim()).filter(Boolean);
    }

    if (/^\d{3,4}$/.test(raw)) {
      return raw.split("");
    }

    return [raw];
  }

  return [];
}

function detectCategory(gameName: string): LottoCategory {
  const n = gameName.toLowerCase();

  if (/pick\s?3|daily\s?3|3\s?digit|midday 3|evening 3/.test(n)) return "pick3";
  if (/pick\s?4|daily\s?4|4\s?digit|midday 4|evening 4/.test(n)) return "pick4";

  if (
    /powerball|mega millions|cash4life|cash 4 life|lotto america|lucky for life|fantasy 5|jackpot/.test(n)
  ) {
    return "jackpot";
  }

  if (/daily|cash 3|cash 4|cash5|pick/.test(n)) return "daily";

  return "other";
}

export function normalizeDraw(raw: AnyJson, fallbackState = "Unknown"): LottoDraw {
  const gameName =
    raw.gameName ||
    raw.game ||
    raw.name ||
    raw.title ||
    raw.lotteryName ||
    "Unknown Game";

  const numbers =
    normalizeNumbers(raw.numbers).length
      ? normalizeNumbers(raw.numbers)
      : normalizeNumbers(raw.winningNumbers).length
      ? normalizeNumbers(raw.winningNumbers)
      : normalizeNumbers(raw.result).length
      ? normalizeNumbers(raw.result)
      : normalizeNumbers(raw.drawResult);

  const bonusNumbers =
    normalizeNumbers(raw.bonusNumbers).length
      ? normalizeNumbers(raw.bonusNumbers)
      : normalizeNumbers(raw.bonus).length
      ? normalizeNumbers(raw.bonus)
      : normalizeNumbers(raw.extra);

  const drawDate =
    raw.drawDate ||
    raw.date ||
    raw.draw_date ||
    raw.drawTime ||
    raw.time ||
    "";

  const state = raw.state || raw.stateName || raw.region || fallbackState;

  return {
    id: String(raw.id || `${gameName}-${drawDate}-${numbers.join("")}`),
    state: String(state),
    gameId: raw.gameID || raw.gameId || raw.id,
    gameName: String(gameName),
    drawDate: String(drawDate),
    numbers: numbers.filter(Boolean),
    bonusNumbers: bonusNumbers.filter(Boolean),
    category: detectCategory(String(gameName)),
    raw,
  };
}

function uniqueSortedDates(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
}

function frequencyMap(draws: LottoDraw[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const draw of draws) {
    for (const n of draw.numbers) {
      out[n] = (out[n] || 0) + 1;
    }
  }
  return out;
}

function pairFrequency(draws: LottoDraw[]): { pair: string; count: number }[] {
  const counts: Record<string, number> = {};

  for (const draw of draws) {
    for (let i = 0; i < draw.numbers.length; i++) {
      for (let j = i + 1; j < draw.numbers.length; j++) {
        const pair = [draw.numbers[i], draw.numbers[j]].sort().join("-");
        counts[pair] = (counts[pair] || 0) + 1;
      }
    }
  }

  return Object.entries(counts)
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

export function buildHistoricalInsights(draws: LottoDraw[]): HistoricalInsights {
  const digitFrequency = frequencyMap(draws);
  const sorted = Object.entries(digitFrequency).sort((a, b) => b[1] - a[1]);

  const hotDigits = sorted.slice(0, 10).map(([digit]) => digit);
  const coldDigits = [...sorted].reverse().slice(0, 10).map(([digit]) => digit);

  const lastSeen: Record<string, string> = {};
  for (const draw of draws) {
    for (const n of draw.numbers) {
      if (!lastSeen[n]) lastSeen[n] = draw.drawDate;
    }
  }

  return {
    totalDraws: draws.length,
    digitFrequency,
    hotDigits,
    coldDigits,
    mostCommonPairs: pairFrequency(draws),
    lastSeen,
  };
}

function pickWeighted(pool: string[], weights: Record<string, number>) {
  const total = pool.reduce((sum, item) => sum + (weights[item] || 1), 0);
  let roll = Math.random() * total;

  for (const item of pool) {
    roll -= weights[item] || 1;
    if (roll <= 0) return item;
  }

  return pool[0];
}

export function generateSequenceFromHistory(
  draws: LottoDraw[],
  length: number,
  mode: GeneratorMode = "balanced"
): SequenceGeneratorResult {
  const freq = frequencyMap(draws);
  const pool =
    Object.keys(freq).length > 0
      ? Object.keys(freq)
      : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const values = Object.values(freq).length ? Object.values(freq) : [1];
  const max = Math.max(...values);
  const min = Math.min(...values);

  const weights: Record<string, number> = {};

  for (const item of pool) {
    const value = freq[item] || 1;

    if (mode === "hot") {
      weights[item] = value;
    } else if (mode === "cold") {
      weights[item] = max - value + 1;
    } else {
      const center = (max + min) / 2;
      const distance = Math.abs(value - center);
      weights[item] = Math.max(1, Math.round(max - distance));
    }
  }

  const generated: string[] = [];
  for (let i = 0; i < length; i++) {
    generated.push(pickWeighted(pool, weights));
  }

  return {
    strategy: mode,
    generated,
    basedOnDraws: draws.length,
    notes: [
      `${mode} history weighting active`,
      `Based on ${draws.length} historical draws`,
      `Use as intelligence, not a guarantee`,
    ],
  };
}

export function scanTicketAgainstHistory(
  ticketNumbers: string[],
  historicalDraws: LottoDraw[]
): TicketScannerHistoryResult {
  const cleanTicket = ticketNumbers.map(cleanString).filter(Boolean);
  const ticketKey = cleanTicket.join("-");

  const exactMatches: LottoDraw[] = [];
  const partialMatches: Array<{
    draw: LottoDraw;
    matchedNumbers: string[];
    matchedCount: number;
  }> = [];

  for (const draw of historicalDraws) {
    const drawKey = draw.numbers.join("-");

    if (drawKey === ticketKey) {
      exactMatches.push(draw);
      continue;
    }

    const matchedNumbers = cleanTicket.filter((n) => draw.numbers.includes(n));
    if (matchedNumbers.length) {
      partialMatches.push({
        draw,
        matchedNumbers,
        matchedCount: matchedNumbers.length,
      });
    }
  }

  partialMatches.sort((a, b) => b.matchedCount - a.matchedCount);

  return {
    ticket: cleanTicket,
    exactMatches,
    partialMatches: partialMatches.slice(0, 30),
    appearedBefore: exactMatches.length > 0,
  };
}

function emptyLiveBucket(): LiveDataBucket {
  return {
    pick3: [],
    pick4: [],
    jackpots: [],
    dailyGames: [],
    otherGames: [],
  };
}

function bucketize(draws: LottoDraw[]): LiveDataBucket {
  const bucket = emptyLiveBucket();

  for (const draw of draws) {
    if (draw.category === "pick3") bucket.pick3.push(draw);
    else if (draw.category === "pick4") bucket.pick4.push(draw);
    else if (draw.category === "jackpot") bucket.jackpots.push(draw);
    else if (draw.category === "daily") bucket.dailyGames.push(draw);
    else bucket.otherGames.push(draw);
  }

  return bucket;
}

export async function getPastDrawDates(gameId: string | number): Promise<string[]> {
  const data = await apiGet<any>(LOTTO_ENDPOINTS.pastDrawDates(gameId));

  const rawDates = asArray(data).flatMap((item) => {
    if (typeof item === "string") return [item];
    return [item.drawDate, item.date, item.draw_date, item.value].filter(Boolean);
  });

  return uniqueSortedDates(rawDates);
}

export async function getHistoricalDraws(
  gameId: string | number,
  dates: string[],
  fallbackState = "Unknown"
): Promise<LottoDraw[]> {
  const requests = dates.map((date) =>
    apiGet<any>(LOTTO_ENDPOINTS.historicalResultsByDate(gameId, date))
      .then((res) => asArray(res).map((raw) => normalizeDraw(raw, fallbackState)))
      .catch(() => [])
  );

  const all = await Promise.all(requests);
  return all.flat().filter((d) => d.numbers.length > 0);
}

export async function getLiveStateData(state: string): Promise<LiveDataBucket> {
  console.log(`[LottoMindAPI] Fetching live data for state: ${state}`);

  const results = await Promise.allSettled([
    apiGet<any>(LOTTO_ENDPOINTS.currentPick3Pick4ByState(state)),
    apiGet<any>(LOTTO_ENDPOINTS.liveAllGamesByState(state)),
    apiGet<any>(LOTTO_ENDPOINTS.liveByState(state)),
  ]);

  const merged: LottoDraw[] = [];

  for (const r of results) {
    if (r.status === "fulfilled") {
      merged.push(...asArray(r.value).map((raw) => normalizeDraw(raw, state)));
    }
  }

  const seen = new Set<string>();
  const deduped = merged.filter((draw) => {
    const key = `${draw.gameName}-${draw.drawDate}-${draw.numbers.join(",")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`[LottoMindAPI] Got ${deduped.length} unique draws for ${state}`);
  return bucketize(deduped);
}

export async function buildLottoMindFeatureBundle(params: {
  state: string;
  gameId: string | number;
  earnedCredits: number;
  includeHistory?: boolean;
  historyDepth?: number;
  scannerTicketNumbers?: string[];
  generatorLength?: number;
  generatorMode?: GeneratorMode;
  powerToolUnlockCredits?: number;
}): Promise<LottoMindFeatureBundle> {
  const {
    state,
    gameId,
    earnedCredits,
    includeHistory = true,
    historyDepth = 15,
    scannerTicketNumbers,
    generatorLength = 4,
    generatorMode = "balanced",
    powerToolUnlockCredits = 150,
  } = params;

  console.log(`[LottoMindAPI] Building feature bundle for ${state}, gameId=${gameId}`);

  const liveData = await getLiveStateData(state);

  let pastDrawDates: string[] = [];
  let historicalDraws: LottoDraw[] = [];

  if (includeHistory) {
    pastDrawDates = await getPastDrawDates(gameId);
    historicalDraws = await getHistoricalDraws(
      gameId,
      pastDrawDates.slice(0, historyDepth),
      state
    );
    console.log(`[LottoMindAPI] Historical: ${pastDrawDates.length} dates, ${historicalDraws.length} draws`);
  }

  const ticketScanner =
    scannerTicketNumbers && historicalDraws.length
      ? scanTicketAgainstHistory(scannerTicketNumbers, historicalDraws)
      : null;

  const generator = historicalDraws.length
    ? generateSequenceFromHistory(historicalDraws, generatorLength, generatorMode)
    : null;

  const historyPowerTool =
    earnedCredits >= powerToolUnlockCredits && historicalDraws.length
      ? buildHistoricalInsights(historicalDraws)
      : null;

  return {
    state,
    historyEnabled: includeHistory,
    liveData,
    historyMenu: {
      available: includeHistory,
      pastDrawDates,
      recentHistoricalDraws: historicalDraws.slice(0, 20),
    },
    ticketScanner,
    generator,
    lottoIntelligence: {
      locked: earnedCredits < powerToolUnlockCredits,
      unlockCostCredits: powerToolUnlockCredits,
      historyPowerTool,
    },
  };
}
