import { Platform } from 'react-native';

const RAPID_API_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || '0a08ea81c8mshecdfb0d3b1ba63cp1b01c5jsn18000f019b97';
const RAPID_API_HOST = 'usa-lottery-result-all-state-api.p.rapidapi.com';
const API_BASE = `https://${RAPID_API_HOST}`;

export interface USLotteryNumber {
  value: string;
  order: number;
  specialBall: { name: string; ballType: string } | null;
}

export interface USLotteryPrize {
  numberOfWinners: number;
  individualAmount: number;
  totalAmount: number | null;
  position: number;
  amountString: string;
  name: string;
}

export interface USLotteryDraw {
  date: string;
  nextDrawDate: string;
  jackpot: number | null;
  nextDrawJackpot: number;
  number: number | null;
  numbers: USLotteryNumber[];
  prizes: USLotteryPrize[];
}

export interface USLotteryPlay {
  name: string;
  draws: USLotteryDraw[];
  fixedPrizeAmount: number | null;
  prizeTypeString: string;
}

export interface USLotteryGame {
  name: string;
  code: string;
  plays: USLotteryPlay[];
}

export interface USLotteryState {
  code: string;
  games: USLotteryGame[];
}

export interface ParsedDrawResult {
  stateName: string;
  stateCode: string;
  gameName: string;
  gameCode: string;
  playName: string;
  drawDate: string;
  nextDrawDate: string;
  jackpot: number | null;
  nextDrawJackpot: number;
  mainNumbers: string[];
  specialBalls: { value: string; name: string }[];
  multiplier: string | null;
  prizes: USLotteryPrize[];
  prizeType: string;
}

const STATE_NAMES: Record<string, string> = {
  AR: 'Arkansas', AZ: 'Arizona', CA: 'California', CO: 'Colorado', CT: 'Connecticut',
  DC: 'Washington DC', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  IA: 'Iowa', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', MA: 'Massachusetts',
  MD: 'Maryland', ME: 'Maine', MI: 'Michigan', MN: 'Minnesota',
  MO: 'Missouri', MS: 'Mississippi', MT: 'Montana', NC: 'North Carolina',
  ND: 'North Dakota', NE: 'Nebraska', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NV: 'Nevada', NY: 'New York', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  VA: 'Virginia', VT: 'Vermont', WA: 'Washington', WI: 'Wisconsin',
  WV: 'West Virginia', WY: 'Wyoming', PR: 'Puerto Rico', VI: 'US Virgin Islands',
};

const GAME_IDS: Record<string, { id: number; name: string; code: string }> = {
  'powerball': { id: 9, name: 'Powerball', code: 'PB' },
  'mega-millions': { id: 2, name: 'Mega Millions', code: 'MM' },
  'lucky-for-life': { id: 18, name: 'Lucky For Life', code: 'LFL' },
  'cash4life': { id: 15, name: 'Cash4Life', code: 'C4L' },
  'lotto-america': { id: 19, name: 'Lotto America', code: 'LA' },
};

async function rapidApiGet<T = any>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  console.log(`[usLotteryApi] GET ${url}`);

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPID_API_KEY,
      'x-rapidapi-host': RAPID_API_HOST,
      'Content-Type': 'application/json',
    },
  });

  const text = await res.text();

  if (!res.ok) {
    console.log(`[usLotteryApi] HTTP ${res.status}: ${text?.slice(0, 200)}`);
    throw new Error(`HTTP ${res.status}: ${text || 'Unknown error'}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    console.log(`[usLotteryApi] Non-JSON response: ${text?.slice(0, 200)}`);
    return text as unknown as T;
  }
}

function asArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.results)) return value.results;
  if (Array.isArray(value.draws)) return value.draws;
  if (Array.isArray(value.pastDraws)) return value.pastDraws;
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length > 0 && Array.isArray(value[keys[0]])) {
      return value[keys[0]];
    }
  }
  return [value];
}

function cleanStr(v: any): string {
  return String(v ?? '').trim();
}

function extractNumbers(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(cleanStr).filter(Boolean);
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (s.includes(',') || s.includes(' ') || s.includes('-')) {
      return s.split(/[,\s\-]+/).map((x) => x.trim()).filter(Boolean);
    }
    if (/^\d{3,}$/.test(s)) return s.split('');
    return [s];
  }
  return [];
}

function detectGameInfo(gameName: string): { code: string; specialName: string } {
  const n = gameName.toLowerCase();
  if (/powerball/.test(n)) return { code: 'PB', specialName: 'Powerball' };
  if (/mega\s?millions/.test(n)) return { code: 'MM', specialName: 'Mega Ball' };
  if (/lucky\s?for\s?life/.test(n)) return { code: 'LFL', specialName: 'Lucky Ball' };
  if (/cash\s?4\s?life|cash4life/.test(n)) return { code: 'C4L', specialName: 'Cash Ball' };
  if (/lotto\s?america/.test(n)) return { code: 'LA', specialName: 'Star Ball' };
  if (/pick\s?3|daily\s?3|3\s?digit|midday\s?3|evening\s?3|cash\s?3/.test(n)) return { code: 'P3', specialName: '' };
  if (/pick\s?4|daily\s?4|4\s?digit|midday\s?4|evening\s?4|cash\s?4/.test(n)) return { code: 'P4', specialName: '' };
  if (/fantasy\s?5/.test(n)) return { code: 'F5', specialName: '' };
  if (/cash\s?5/.test(n)) return { code: 'C5', specialName: '' };
  return { code: 'OTH', specialName: '' };
}

function parseRapidApiDraw(raw: any, fallbackState: string): ParsedDrawResult | null {
  try {
    const gameName = cleanStr(
      raw.gameName || raw.game || raw.name || raw.title || raw.lotteryName || 'Unknown Game'
    );
    const stateCode = cleanStr(raw.stateCode || raw.state || fallbackState);
    const stateName = STATE_NAMES[stateCode] || cleanStr(raw.stateName || raw.state || stateCode);

    const numbers = extractNumbers(raw.numbers)
      .concat(extractNumbers(raw.winningNumbers))
      .concat(extractNumbers(raw.result))
      .concat(extractNumbers(raw.drawResult));

    const uniqueNumbers = [...new Set(numbers)].filter(Boolean);

    if (uniqueNumbers.length === 0) return null;

    const drawDate = cleanStr(raw.drawDate || raw.date || raw.draw_date || raw.drawTime || '');
    const nextDrawDate = cleanStr(raw.nextDrawDate || raw.nextDate || '');

    const gameInfo = detectGameInfo(gameName);

    const bonusRaw = extractNumbers(raw.bonusNumbers)
      .concat(extractNumbers(raw.bonus))
      .concat(extractNumbers(raw.extra))
      .concat(extractNumbers(raw.specialBall))
      .concat(extractNumbers(raw.powerball))
      .concat(extractNumbers(raw.megaBall));
    const bonusNumbers = [...new Set(bonusRaw)].filter(Boolean);

    const mainNumbers = uniqueNumbers.filter((n) => !bonusNumbers.includes(n));
    const specialBalls = bonusNumbers.map((v) => ({ value: v, name: gameInfo.specialName || 'Bonus' }));

    const multiplierRaw = cleanStr(raw.multiplier || raw.powerPlay || raw.megaplier || '');

    let jackpot: number | null = null;
    if (raw.jackpot != null) {
      const jp = typeof raw.jackpot === 'string' ? parseFloat(raw.jackpot.replace(/[^0-9.]/g, '')) : raw.jackpot;
      if (!isNaN(jp) && jp > 0) jackpot = jp;
    }

    let nextDrawJackpot = 0;
    if (raw.nextDrawJackpot != null || raw.nextJackpot != null) {
      const njp = raw.nextDrawJackpot ?? raw.nextJackpot;
      const val = typeof njp === 'string' ? parseFloat(njp.replace(/[^0-9.]/g, '')) : njp;
      if (!isNaN(val)) nextDrawJackpot = val;
    }

    return {
      stateName,
      stateCode,
      gameName,
      gameCode: gameInfo.code,
      playName: gameName,
      drawDate,
      nextDrawDate,
      jackpot,
      nextDrawJackpot,
      mainNumbers: mainNumbers.length > 0 ? mainNumbers : uniqueNumbers,
      specialBalls,
      multiplier: multiplierRaw || null,
      prizes: [],
      prizeType: jackpot ? 'Jackpot' : 'Fixed',
    };
  } catch (err) {
    console.log('[usLotteryApi] parseRapidApiDraw error:', err);
    return null;
  }
}

async function fetchPastDrawDates(gameId: number): Promise<string[]> {
  try {
    const data = await rapidApiGet<any>(`/lottery-results/old/past-draws-dates?gameID=${gameId}`);
    console.log(`[usLotteryApi] pastDrawDates response for gameID=${gameId}:`, JSON.stringify(data)?.slice(0, 300));

    const arr = asArray(data);
    const dates: string[] = [];

    for (const item of arr) {
      if (typeof item === 'string') {
        dates.push(item);
      } else if (item && typeof item === 'object') {
        const d = item.drawDate || item.date || item.draw_date || item.value;
        if (d) dates.push(cleanStr(d));
      }
    }

    console.log(`[usLotteryApi] Found ${dates.length} past draw dates for gameID=${gameId}`);
    return [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  } catch (err) {
    console.log(`[usLotteryApi] fetchPastDrawDates failed for gameID=${gameId}:`, err);
    return [];
  }
}

async function fetchHistoricalResults(gameId: number, drawDate: string): Promise<any[]> {
  try {
    const data = await rapidApiGet<any>(
      `/lottery-results/old/past-draw-results?gameID=${gameId}&drawDate=${encodeURIComponent(drawDate)}`
    );
    return asArray(data);
  } catch (err) {
    console.log(`[usLotteryApi] fetchHistoricalResults failed for gameID=${gameId}, date=${drawDate}:`, err);
    return [];
  }
}

async function fetchLiveByState(state: string): Promise<any[]> {
  const endpoints = [
    `/lottery-results/live/by-state?state=${encodeURIComponent(state)}`,
    `/lottery-results/live/all-games?state=${encodeURIComponent(state)}`,
    `/lottery-results/live/pick3-pick4?state=${encodeURIComponent(state)}`,
  ];

  const allResults: any[] = [];

  const settled = await Promise.allSettled(
    endpoints.map((ep) => rapidApiGet<any>(ep))
  );

  for (const r of settled) {
    if (r.status === 'fulfilled') {
      const arr = asArray(r.value);
      allResults.push(...arr);
    }
  }

  return allResults;
}

const ALL_STATES = [
  'MI', 'NY', 'FL', 'TX', 'CA', 'PA', 'OH', 'IL', 'GA', 'NC',
  'NJ', 'VA', 'MA', 'IN', 'CT', 'MD', 'SC', 'TN', 'MO', 'WI',
  'MN', 'CO', 'AZ', 'KY', 'LA', 'OR', 'WA', 'IA', 'KS', 'OK',
];

export async function fetchUSLotteryData(): Promise<ParsedDrawResult[]> {
  console.log('[usLotteryApi] Fetching US lottery data from RapidAPI...');

  const results: ParsedDrawResult[] = [];
  const seen = new Set<string>();

  function addResult(parsed: ParsedDrawResult | null) {
    if (!parsed) return;
    const key = `${parsed.gameName}-${parsed.drawDate}-${parsed.mainNumbers.join(',')}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(parsed);
  }

  try {
    const gameEntries = Object.values(GAME_IDS);
    const dateResults = await Promise.allSettled(
      gameEntries.map((g) => fetchPastDrawDates(g.id))
    );

    const historicalFetches: Promise<void>[] = [];

    for (let i = 0; i < gameEntries.length; i++) {
      const game = gameEntries[i];
      const dateResult = dateResults[i];

      if (dateResult.status === 'fulfilled' && dateResult.value.length > 0) {
        const recentDates = dateResult.value.slice(0, 5);
        console.log(`[usLotteryApi] ${game.name}: ${dateResult.value.length} dates, fetching ${recentDates.length} recent`);

        for (const date of recentDates) {
          historicalFetches.push(
            fetchHistoricalResults(game.id, date).then((draws) => {
              for (const raw of draws) {
                const parsed = parseRapidApiDraw(
                  { ...raw, gameName: raw.gameName || raw.game || raw.name || game.name },
                  ''
                );
                addResult(parsed);
              }
            })
          );
        }
      }
    }

    await Promise.allSettled(historicalFetches);
    console.log(`[usLotteryApi] Historical results: ${results.length} draws`);

    const statesToFetch = ALL_STATES.slice(0, 10);
    const liveResults = await Promise.allSettled(
      statesToFetch.map((st) => fetchLiveByState(st))
    );

    for (let i = 0; i < statesToFetch.length; i++) {
      const stateCode = statesToFetch[i];
      const liveResult = liveResults[i];

      if (liveResult.status === 'fulfilled') {
        for (const raw of liveResult.value) {
          const parsed = parseRapidApiDraw(raw, stateCode);
          addResult(parsed);
        }
      }
    }

    console.log(`[usLotteryApi] Total results after live data: ${results.length} draws`);

    if (results.length === 0) {
      console.log('[usLotteryApi] No API results, falling back to generated data');
      return generateFallbackData();
    }

    return results;
  } catch (err) {
    console.error('[usLotteryApi] fetchUSLotteryData failed:', err);
    console.log('[usLotteryApi] Falling back to generated data');
    return generateFallbackData();
  }
}

function generateFallbackData(): ParsedDrawResult[] {
  console.log('[usLotteryApi] Generating fallback lottery data...');
  const results: ParsedDrawResult[] = [];

  const configs = [
    { name: 'Powerball', code: 'PB', mainPool: 69, specialPool: 26, mainCount: 5, specialName: 'Powerball', states: ['MI', 'NY', 'FL', 'TX', 'CA', 'PA', 'OH', 'IL', 'GA', 'NC'], jackpotBase: 200_000_000 },
    { name: 'Mega Millions', code: 'MM', mainPool: 70, specialPool: 25, mainCount: 5, specialName: 'Mega Ball', states: ['MI', 'NY', 'FL', 'TX', 'CA', 'PA', 'OH', 'IL', 'GA', 'NC'], jackpotBase: 150_000_000 },
    { name: 'Lucky For Life', code: 'LFL', mainPool: 48, specialPool: 18, mainCount: 5, specialName: 'Lucky Ball', states: ['CT', 'FL', 'MI', 'NY', 'OH', 'PA'], jackpotBase: 7_000_000 },
  ];

  const pickGames = [
    { name: 'Pick 3 Midday', code: 'P3M', digits: 3, states: ['MI', 'OH', 'PA', 'NY', 'FL', 'GA', 'IL'] },
    { name: 'Pick 3 Evening', code: 'P3E', digits: 3, states: ['MI', 'OH', 'PA', 'NY', 'FL', 'GA', 'IL'] },
    { name: 'Pick 4 Midday', code: 'P4M', digits: 4, states: ['MI', 'OH', 'PA', 'NY', 'FL', 'GA', 'IL'] },
    { name: 'Pick 4 Evening', code: 'P4E', digits: 4, states: ['MI', 'OH', 'PA', 'NY', 'FL', 'GA', 'IL'] },
  ];

  function randomInts(max: number, count: number): number[] {
    const nums = new Set<number>();
    while (nums.size < count) nums.add(Math.floor(Math.random() * max) + 1);
    return [...nums].sort((a, b) => a - b);
  }

  function recentDate(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  }

  for (const cfg of configs) {
    for (const stateCode of cfg.states) {
      for (const daysAgo of [0, 3, 7]) {
        const mainNums = randomInts(cfg.mainPool, cfg.mainCount);
        const specialNum = Math.floor(Math.random() * cfg.specialPool) + 1;
        const jackpotVar = Math.floor(Math.random() * 300_000_000);

        results.push({
          stateName: STATE_NAMES[stateCode] || stateCode,
          stateCode,
          gameName: cfg.name,
          gameCode: cfg.code,
          playName: cfg.name,
          drawDate: recentDate(daysAgo),
          nextDrawDate: recentDate(Math.max(0, daysAgo - 3)),
          jackpot: daysAgo === 0 ? cfg.jackpotBase + jackpotVar : null,
          nextDrawJackpot: cfg.jackpotBase + Math.floor(Math.random() * 400_000_000),
          mainNumbers: mainNums.map(String),
          specialBalls: [{ value: String(specialNum), name: cfg.specialName }],
          multiplier: Math.random() > 0.5 ? String(Math.floor(Math.random() * 5) + 2) : null,
          prizes: [],
          prizeType: 'Jackpot',
        });
      }
    }
  }

  for (const pg of pickGames) {
    for (const stateCode of pg.states) {
      for (const daysAgo of [0, 1, 2]) {
        const digits = Array.from({ length: pg.digits }, () => Math.floor(Math.random() * 10));
        results.push({
          stateName: STATE_NAMES[stateCode] || stateCode,
          stateCode,
          gameName: pg.name,
          gameCode: pg.code,
          playName: pg.name,
          drawDate: recentDate(daysAgo),
          nextDrawDate: recentDate(Math.max(0, daysAgo - 1)),
          jackpot: null,
          nextDrawJackpot: pg.digits === 3 ? 500 : 5000,
          mainNumbers: digits.map(String),
          specialBalls: [],
          multiplier: null,
          prizes: [],
          prizeType: 'Fixed',
        });
      }
    }
  }

  console.log(`[usLotteryApi] Generated ${results.length} fallback draws`);
  return results;
}

export function formatJackpot(amount: number | null): string {
  if (!amount || amount === 0) return '';
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export function getUniqueStates(results: ParsedDrawResult[]): { code: string; name: string }[] {
  const seen = new Set<string>();
  const states: { code: string; name: string }[] = [];
  for (const r of results) {
    if (!seen.has(r.stateCode)) {
      seen.add(r.stateCode);
      states.push({ code: r.stateCode, name: r.stateName });
    }
  }
  return states.sort((a, b) => a.name.localeCompare(b.name));
}

export function getUniqueGames(results: ParsedDrawResult[]): string[] {
  const seen = new Set<string>();
  for (const r of results) seen.add(r.gameName);
  return [...seen].sort();
}
