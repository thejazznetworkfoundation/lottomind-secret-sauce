import { GameType, LiveDraw, LotteryApiRecord } from '@/types/lottery';

const PB_URL = 'https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date DESC&$limit=500';
const MM_URL = 'https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date DESC&$limit=500';

export interface NumberFrequency {
  number: number;
  count: number;
  percentage: number;
  lastSeen: string | null;
  daysSinceLastSeen: number;
}

export interface PairCombo {
  pair: [number, number];
  count: number;
  games: string[];
}

export interface CrossOverlap {
  number: number;
  pbCount: number;
  mmCount: number;
  totalCount: number;
}

export interface NationwideAnalysis {
  powerball: {
    draws: LiveDraw[];
    hot: NumberFrequency[];
    cold: NumberFrequency[];
    totalDraws: number;
  };
  megamillions: {
    draws: LiveDraw[];
    hot: NumberFrequency[];
    cold: NumberFrequency[];
    totalDraws: number;
  };
  topPairs: PairCombo[];
  crossOverlaps: CrossOverlap[];
  lastUpdated: string;
}

function parseNumbers(value: string | undefined): number[] {
  if (!value) return [];
  return value
    .split(/[\s,]+/)
    .map((p) => Number.parseInt(p.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function normalizeDraw(game: GameType, r: LotteryApiRecord): LiveDraw | null {
  const nums = parseNumbers(r.winning_numbers);
  if (nums.length < 6) return null;
  const bonus = nums[nums.length - 1] ?? 0;
  const main = nums.slice(0, 5).sort((a, b) => a - b);
  if (main.length !== 5 || bonus <= 0) return null;
  return {
    id: `${game}-${r.draw_date}-${r.winning_numbers}`,
    game,
    drawDate: r.draw_date,
    numbers: main,
    bonusNumber: bonus,
    multiplier: r.multiplier ? Number.parseInt(r.multiplier, 10) : null,
    jackpot: r.jackpot ?? null,
    videoUrl: r.video_url ?? null,
    source: 'live',
  };
}

async function fetchAll(url: string, game: GameType): Promise<LiveDraw[]> {
  console.log(`[nationwideAnalysis] Fetching ${game} from ${url}`);
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Failed to fetch ${game} data`);
  const raw = (await res.json()) as LotteryApiRecord[];
  return raw.map((r) => normalizeDraw(game, r)).filter((d): d is LiveDraw => d !== null);
}

function computeFrequencies(draws: LiveDraw[], maxNum: number): NumberFrequency[] {
  const counts = new Map<number, { count: number; lastSeen: string | null }>();
  for (let i = 1; i <= maxNum; i++) {
    counts.set(i, { count: 0, lastSeen: null });
  }

  for (const draw of draws) {
    for (const num of draw.numbers) {
      const entry = counts.get(num);
      if (entry) {
        entry.count += 1;
        if (!entry.lastSeen || draw.drawDate > entry.lastSeen) {
          entry.lastSeen = draw.drawDate;
        }
      }
    }
  }

  const total = draws.length;
  const now = Date.now();
  const result: NumberFrequency[] = [];

  counts.forEach((val, num) => {
    const daysSince = val.lastSeen
      ? Math.floor((now - new Date(val.lastSeen).getTime()) / 86400000)
      : 9999;
    result.push({
      number: num,
      count: val.count,
      percentage: total > 0 ? Math.round((val.count / total) * 10000) / 100 : 0,
      lastSeen: val.lastSeen,
      daysSinceLastSeen: daysSince,
    });
  });

  return result;
}

function computeTopPairs(pbDraws: LiveDraw[], mmDraws: LiveDraw[]): PairCombo[] {
  const pairMap = new Map<string, { pair: [number, number]; count: number; games: Set<string> }>();

  const processDraw = (draw: LiveDraw) => {
    const nums = draw.numbers;
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const key = `${nums[i]}-${nums[j]}`;
        const entry = pairMap.get(key);
        if (entry) {
          entry.count += 1;
          entry.games.add(draw.game);
        } else {
          pairMap.set(key, {
            pair: [nums[i]!, nums[j]!],
            count: 1,
            games: new Set([draw.game]),
          });
        }
      }
    }
  };

  pbDraws.forEach(processDraw);
  mmDraws.forEach(processDraw);

  return Array.from(pairMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .map((e) => ({ pair: e.pair, count: e.count, games: Array.from(e.games) }));
}

function computeCrossOverlaps(
  pbFreqs: NumberFrequency[],
  mmFreqs: NumberFrequency[]
): CrossOverlap[] {
  const mmMap = new Map<number, number>();
  mmFreqs.forEach((f) => mmMap.set(f.number, f.count));

  const overlaps: CrossOverlap[] = [];
  for (const pf of pbFreqs) {
    const mmCount = mmMap.get(pf.number) ?? 0;
    if (pf.count > 0 && mmCount > 0) {
      overlaps.push({
        number: pf.number,
        pbCount: pf.count,
        mmCount,
        totalCount: pf.count + mmCount,
      });
    }
  }

  return overlaps.sort((a, b) => b.totalCount - a.totalCount).slice(0, 25);
}

export async function fetchNationwideAnalysis(): Promise<NationwideAnalysis> {
  console.log('[nationwideAnalysis] Starting full nationwide analysis...');

  const [pbDraws, mmDraws] = await Promise.all([
    fetchAll(PB_URL, 'powerball'),
    fetchAll(MM_URL, 'megamillions'),
  ]);

  console.log(`[nationwideAnalysis] Fetched PB=${pbDraws.length}, MM=${mmDraws.length}`);

  const pbFreqs = computeFrequencies(pbDraws, 69);
  const mmFreqs = computeFrequencies(mmDraws, 70);

  const pbHot = [...pbFreqs].sort((a, b) => b.count - a.count).slice(0, 15);
  const pbCold = [...pbFreqs].sort((a, b) => a.count - b.count).slice(0, 15);
  const mmHot = [...mmFreqs].sort((a, b) => b.count - a.count).slice(0, 15);
  const mmCold = [...mmFreqs].sort((a, b) => a.count - b.count).slice(0, 15);

  const topPairs = computeTopPairs(pbDraws, mmDraws);
  const crossOverlaps = computeCrossOverlaps(pbFreqs, mmFreqs);

  return {
    powerball: { draws: pbDraws, hot: pbHot, cold: pbCold, totalDraws: pbDraws.length },
    megamillions: { draws: mmDraws, hot: mmHot, cold: mmCold, totalDraws: mmDraws.length },
    topPairs,
    crossOverlaps,
    lastUpdated: new Date().toISOString(),
  };
}
