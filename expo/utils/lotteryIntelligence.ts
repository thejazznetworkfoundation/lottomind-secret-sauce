import { GameType, LiveDraw, FrequencyData, GeneratedSet } from '@/types/lottery';
import { GAME_CONFIGS } from '@/constants/games';

export interface IntelligenceReport {
  game: GameType;
  overduNumbers: number[];
  streakNumbers: number[];
  pairPatterns: { pair: string; count: number }[];
  gapAnalysis: { number: number; gapSinceLast: number }[];
  trendDirection: 'heating' | 'cooling' | 'stable';
  recommendation: string;
  smartPicks: number[];
  smartBonus: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  insights: string[];
  updatedAt: string;
}

export function buildIntelligenceReport(
  game: GameType,
  draws: LiveDraw[],
  frequencies: FrequencyData[],
  history: GeneratedSet[],
  hotNumbers: number[],
  coldNumbers: number[]
): IntelligenceReport {
  const config = GAME_CONFIGS[game];
  console.log('[Intelligence] Building report for', game, 'with', draws.length, 'draws');

  const overduNumbers = findOverdueNumbers(draws, config.mainRange);
  const streakNumbers = findStreakNumbers(draws);
  const pairPatterns = findPairPatterns(draws);
  const gapAnalysis = computeGapAnalysis(draws, config.mainRange);
  const trendDirection = detectTrendDirection(draws);

  const insights: string[] = [];

  if (overduNumbers.length > 0) {
    insights.push(`Numbers ${overduNumbers.slice(0, 3).join(', ')} are overdue — haven't appeared in ${Math.min(draws.length, 15)}+ draws`);
  }

  if (streakNumbers.length > 0) {
    insights.push(`Numbers ${streakNumbers.slice(0, 3).join(', ')} are on a hot streak — appeared in 3+ of the last 5 draws`);
  }

  if (pairPatterns.length > 0) {
    insights.push(`Pair ${pairPatterns[0].pair} appeared together ${pairPatterns[0].count} times recently`);
  }

  const recentUserPicks = history.filter(h => h.game === game).slice(0, 10);
  if (recentUserPicks.length > 0) {
    const userFreqMap = new Map<number, number>();
    recentUserPicks.forEach(pick => {
      pick.numbers.forEach(n => userFreqMap.set(n, (userFreqMap.get(n) ?? 0) + 1));
    });
    const mostPicked = [...userFreqMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (mostPicked.length > 0) {
      insights.push(`You tend to pick ${mostPicked.map(p => p[0]).join(', ')} — consider diversifying`);
    }
  }

  if (trendDirection === 'heating') {
    insights.push('Overall trend is heating up — hot numbers have higher recent frequency');
  } else if (trendDirection === 'cooling') {
    insights.push('Overall trend is cooling — cold numbers may be due for a comeback');
  } else {
    insights.push('Draw distribution is relatively stable — balanced strategy recommended');
  }

  const smartPicks = generateSmartPicks(
    config.mainCount,
    config.mainRange,
    hotNumbers,
    coldNumbers,
    overduNumbers,
    streakNumbers,
    frequencies
  );

  const bonusPool = [...hotNumbers.slice(0, 3), ...overduNumbers.slice(0, 2)];
  const smartBonus = bonusPool.length > 0
    ? Math.max(1, Math.min(config.bonusRange, bonusPool[Math.floor(Math.random() * bonusPool.length)]))
    : Math.floor(Math.random() * config.bonusRange) + 1;

  let riskLevel: 'conservative' | 'moderate' | 'aggressive' = 'moderate';
  const hotInPicks = smartPicks.filter(n => hotNumbers.includes(n)).length;
  if (hotInPicks >= 4) riskLevel = 'aggressive';
  else if (hotInPicks <= 1) riskLevel = 'conservative';

  let recommendation = '';
  if (riskLevel === 'aggressive') {
    recommendation = 'High-momentum picks loaded with trending numbers. Good for when you feel lucky.';
  } else if (riskLevel === 'conservative') {
    recommendation = 'Diversified picks mixing cold and overdue numbers. Lower variance approach.';
  } else {
    recommendation = 'Balanced blend of hot trends, overdue numbers, and pattern signals.';
  }

  return {
    game,
    overduNumbers: overduNumbers.slice(0, 8),
    streakNumbers: streakNumbers.slice(0, 8),
    pairPatterns: pairPatterns.slice(0, 5),
    gapAnalysis: gapAnalysis.slice(0, 10),
    trendDirection,
    recommendation,
    smartPicks,
    smartBonus,
    riskLevel,
    insights,
    updatedAt: new Date().toISOString(),
  };
}

function findOverdueNumbers(draws: LiveDraw[], maxRange: number): number[] {
  if (draws.length === 0) return [];

  const lastSeen = new Map<number, number>();
  for (let i = 1; i <= maxRange; i++) lastSeen.set(i, draws.length);

  draws.forEach((draw, idx) => {
    draw.numbers.forEach(n => {
      if (!lastSeen.has(n) || (lastSeen.get(n) ?? draws.length) > idx) {
        lastSeen.set(n, idx);
      }
    });
  });

  return [...lastSeen.entries()]
    .filter(([_, gap]) => gap >= Math.min(draws.length, 10))
    .sort((a, b) => b[1] - a[1])
    .map(([num]) => num);
}

function findStreakNumbers(draws: LiveDraw[]): number[] {
  if (draws.length < 3) return [];

  const recent = draws.slice(0, 5);
  const countMap = new Map<number, number>();
  recent.forEach(draw => {
    draw.numbers.forEach(n => countMap.set(n, (countMap.get(n) ?? 0) + 1));
  });

  return [...countMap.entries()]
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([num]) => num);
}

function findPairPatterns(draws: LiveDraw[]): { pair: string; count: number }[] {
  const pairMap = new Map<string, number>();
  const recent = draws.slice(0, 15);

  recent.forEach(draw => {
    for (let i = 0; i < draw.numbers.length; i++) {
      for (let j = i + 1; j < draw.numbers.length; j++) {
        const key = `${Math.min(draw.numbers[i], draw.numbers[j])}-${Math.max(draw.numbers[i], draw.numbers[j])}`;
        pairMap.set(key, (pairMap.get(key) ?? 0) + 1);
      }
    }
  });

  return [...pairMap.entries()]
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([pair, count]) => ({ pair, count }));
}

function computeGapAnalysis(draws: LiveDraw[], maxRange: number): { number: number; gapSinceLast: number }[] {
  if (draws.length === 0) return [];

  const gaps: { number: number; gapSinceLast: number }[] = [];
  for (let n = 1; n <= maxRange; n++) {
    let gap = draws.length;
    for (let i = 0; i < draws.length; i++) {
      if (draws[i].numbers.includes(n)) {
        gap = i;
        break;
      }
    }
    gaps.push({ number: n, gapSinceLast: gap });
  }

  return gaps.sort((a, b) => b.gapSinceLast - a.gapSinceLast);
}

function detectTrendDirection(draws: LiveDraw[]): 'heating' | 'cooling' | 'stable' {
  if (draws.length < 6) return 'stable';

  const recentAvg = draws.slice(0, 3).reduce((sum, d) => sum + d.numbers.reduce((s, n) => s + n, 0), 0) / 3;
  const olderAvg = draws.slice(3, 6).reduce((sum, d) => sum + d.numbers.reduce((s, n) => s + n, 0), 0) / 3;

  const diff = recentAvg - olderAvg;
  if (diff > 15) return 'heating';
  if (diff < -15) return 'cooling';
  return 'stable';
}

function generateSmartPicks(
  count: number,
  maxRange: number,
  hotNumbers: number[],
  coldNumbers: number[],
  overdueNumbers: number[],
  streakNumbers: number[],
  frequencies: FrequencyData[]
): number[] {
  const pool: { num: number; weight: number }[] = [];

  for (let i = 1; i <= maxRange; i++) {
    let weight = 1;
    const freq = frequencies[i - 1];
    if (freq) weight += freq.score * 3;
    if (hotNumbers.includes(i)) weight += 2;
    if (streakNumbers.includes(i)) weight += 3;
    if (overdueNumbers.includes(i)) weight += 1.5;
    if (coldNumbers.includes(i)) weight += 0.5;
    pool.push({ num: i, weight });
  }

  const totalWeight = pool.reduce((s, p) => s + p.weight, 0);
  const selected = new Set<number>();
  let guard = 0;

  while (selected.size < count && guard < 500) {
    let random = Math.random() * totalWeight;
    for (const p of pool) {
      random -= p.weight;
      if (random <= 0) {
        selected.add(p.num);
        break;
      }
    }
    guard++;
  }

  return [...selected].sort((a, b) => a - b);
}
