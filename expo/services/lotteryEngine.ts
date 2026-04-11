import { GameType, LiveDraw, LotteryApiRecord } from '@/types/lottery';
import { getStateConfig, type StateConfig } from '@/config/states';
import { getCache, setCache } from '@/services/cache';

const POWERBALL_URL = 'https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date DESC&$limit=25';
const MEGA_MILLIONS_URL = 'https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date DESC&$limit=25';

const ENDPOINTS: Record<GameType, string> = {
  powerball: POWERBALL_URL,
  megamillions: MEGA_MILLIONS_URL,
};

const CACHE_TTL = 5 * 60 * 1000;

function parseNumberList(value: string | undefined): number[] {
  if (!value) return [];
  return value
    .split(/[\s,]+/)
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((num) => Number.isFinite(num) && num > 0);
}

function normalizeRecord(game: GameType, record: LotteryApiRecord): LiveDraw | null {
  const numbers = parseNumberList(record.winning_numbers);
  if (numbers.length < 6) return null;

  const bonusNumber = numbers[numbers.length - 1] ?? 0;
  const mainNumbers = numbers.slice(0, 5).sort((a, b) => a - b);
  if (mainNumbers.length !== 5 || bonusNumber <= 0) return null;

  return {
    id: `${game}-${record.draw_date}-${record.winning_numbers}`,
    game,
    drawDate: record.draw_date,
    numbers: mainNumbers,
    bonusNumber,
    multiplier: record.multiplier ? Number.parseInt(record.multiplier, 10) : null,
    jackpot: record.jackpot ?? null,
    videoUrl: record.video_url ?? null,
    source: 'live',
  };
}

function generateFallbackDraws(game: GameType): LiveDraw[] {
  const config = game === 'powerball'
    ? { mainRange: 69, bonusRange: 26, name: 'powerball' }
    : { mainRange: 70, bonusRange: 25, name: 'megamillions' };

  const draws: LiveDraw[] = [];
  const today = new Date();

  for (let i = 0; i < 10; i++) {
    const drawDate = new Date(today);
    drawDate.setDate(today.getDate() - (i * 3 + 1));
    const seed = drawDate.getTime() + i * 7919;
    let s = seed;
    const rng = () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };

    const pool: number[] = [];
    for (let n = 1; n <= config.mainRange; n++) pool.push(n);
    for (let j = pool.length - 1; j > 0; j--) {
      const k = Math.floor(rng() * (j + 1));
      [pool[j], pool[k]] = [pool[k], pool[j]];
    }
    const numbers = pool.slice(0, 5).sort((a, b) => a - b);
    const bonusNumber = Math.floor(rng() * config.bonusRange) + 1;
    const multiplier = [2, 3, 4, 5, 10][Math.floor(rng() * 5)];

    draws.push({
      id: `${game}-fallback-${i}`,
      game,
      drawDate: drawDate.toISOString().split('T')[0],
      numbers,
      bonusNumber,
      multiplier,
      jackpot: `${Math.floor(rng() * 500 + 50)} Million`,
      videoUrl: null,
      source: 'fallback',
    });
  }

  console.log('[LotteryEngine] Generated fallback draws for', game, draws.length);
  return draws;
}

export async function fetchRecentDraws(game: GameType): Promise<LiveDraw[]> {
  const cacheKey = `draws-${game}`;
  const cached = getCache<LiveDraw[]>(cacheKey);
  if (cached) return cached;

  const endpoint = ENDPOINTS[game];
  console.log('[LotteryEngine] Fetching draws', { game, endpoint });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log('[LotteryEngine] HTTP error:', response.status, '- using fallback');
      const fallback = generateFallbackDraws(game);
      setCache(cacheKey, fallback, CACHE_TTL);
      return fallback;
    }

    const raw = (await response.json()) as LotteryApiRecord[];
    const draws = raw
      .map((record) => normalizeRecord(game, record))
      .filter((draw): draw is LiveDraw => draw !== null);

    if (draws.length === 0) {
      console.log('[LotteryEngine] No valid draws parsed - using fallback');
      const fallback = generateFallbackDraws(game);
      setCache(cacheKey, fallback, CACHE_TTL);
      return fallback;
    }

    console.log('[LotteryEngine] Loaded draws', { game, count: draws.length });
    setCache(cacheKey, draws, CACHE_TTL);
    return draws;
  } catch (error) {
    console.log('[LotteryEngine] Fetch error for', game, ':', error, '- using fallback');
    const fallback = generateFallbackDraws(game);
    setCache(cacheKey, fallback, CACHE_TTL);
    return fallback;
  }
}

export interface StateResults {
  state: StateConfig;
  games: string[];
  draws: LiveDraw[];
  timestamp: string;
}

export async function getStateResults(stateCode: string): Promise<StateResults> {
  const config = getStateConfig(stateCode);
  if (!config) {
    throw new Error(`Invalid state: ${stateCode}`);
  }

  const cacheKey = `state-results-${stateCode}`;
  const cached = getCache<StateResults>(cacheKey);
  if (cached) return cached;

  console.log('[LotteryEngine] Fetching state results for', config.name);

  const allDraws: LiveDraw[] = [];
  const gameTypes: GameType[] = [];
  if (config.games.includes('powerball')) gameTypes.push('powerball');
  if (config.games.includes('megamillions')) gameTypes.push('megamillions');

  const drawPromises = gameTypes.map(async (gt) => {
    try {
      return await fetchRecentDraws(gt);
    } catch (err) {
      console.log(`[LotteryEngine] Failed to fetch ${gt} for ${stateCode}:`, err);
      return [];
    }
  });

  const results = await Promise.all(drawPromises);
  results.forEach((draws) => allDraws.push(...draws));

  const stateResults: StateResults = {
    state: config,
    games: config.games,
    draws: allDraws,
    timestamp: new Date().toISOString(),
  };

  setCache(cacheKey, stateResults, CACHE_TTL);
  return stateResults;
}

export async function getMultiStateResults(stateCodes: string[]): Promise<StateResults[]> {
  console.log('[LotteryEngine] Fetching multi-state results for', stateCodes.join(', '));
  const promises = stateCodes.map((code) => getStateResults(code));
  const results = await Promise.allSettled(promises);
  return results
    .filter((r): r is PromiseFulfilledResult<StateResults> => r.status === 'fulfilled')
    .map((r) => r.value);
}

export function getDrawHistory(draws: LiveDraw[], limit: number = 50): number[] {
  const allNumbers: number[] = [];
  draws.slice(0, limit).forEach((d) => {
    d.numbers.forEach((n) => allNumbers.push(n));
  });
  return allNumbers;
}
