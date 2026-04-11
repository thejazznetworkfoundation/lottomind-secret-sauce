import { GAME_CONFIGS } from '@/constants/games';
import {
  FrequencyData,
  GameType,
  LiveDraw,
  PredictionContext,
  PredictionInsights,
  StrategyType,
} from '@/types/lottery';

function createBaseFrequency(game: GameType): FrequencyData[] {
  const config = GAME_CONFIGS[game];

  return Array.from({ length: config.mainRange }, (_, index) => ({
    number: index + 1,
    frequency: 0,
    normalized: 0,
    recencyScore: 0,
    momentumScore: 0,
    pairScore: 0,
    score: 0,
  }));
}

function buildPairMap(draws: LiveDraw[]): Map<string, number> {
  const pairMap = new Map<string, number>();

  draws.forEach((draw) => {
    draw.numbers.forEach((left, leftIndex) => {
      draw.numbers.slice(leftIndex + 1).forEach((right) => {
        const key = `${Math.min(left, right)}-${Math.max(left, right)}`;
        pairMap.set(key, (pairMap.get(key) ?? 0) + 1);
      });
    });
  });

  return pairMap;
}

export function buildPredictionContext(game: GameType, draws: LiveDraw[]): PredictionContext {
  const frequencies = createBaseFrequency(game);
  const pairMap = buildPairMap(draws);

  draws.forEach((draw, drawIndex) => {
    const recencyWeight = Math.max(draws.length - drawIndex, 1);
    const momentumWeight = drawIndex < 5 ? 2.4 : drawIndex < 10 ? 1.3 : 0.6;

    draw.numbers.forEach((number) => {
      const target = frequencies[number - 1];
      if (!target) {
        return;
      }

      target.frequency += 1;
      target.recencyScore += recencyWeight;
      target.momentumScore += momentumWeight;
    });
  });

  const maxFrequency = Math.max(...frequencies.map((item) => item.frequency), 1);
  const maxRecency = Math.max(...frequencies.map((item) => item.recencyScore), 1);
  const maxMomentum = Math.max(...frequencies.map((item) => item.momentumScore), 1);
  const topRecentDraw = draws.slice(0, 8);

  const enriched = frequencies.map((item) => {
    const recentPairBoost = topRecentDraw.reduce((boost, draw) => {
      if (!draw.numbers.includes(item.number)) {
        return boost;
      }

      const drawBoost = draw.numbers.reduce((sum, pairCandidate) => {
        if (pairCandidate === item.number) {
          return sum;
        }

        const key = `${Math.min(item.number, pairCandidate)}-${Math.max(item.number, pairCandidate)}`;
        return sum + (pairMap.get(key) ?? 0);
      }, 0);

      return boost + drawBoost;
    }, 0);

    const normalized = item.frequency / maxFrequency;
    const recencyScore = item.recencyScore / maxRecency;
    const momentumScore = item.momentumScore / maxMomentum;
    const pairScore = recentPairBoost / Math.max(draws.length * 5, 1);
    const score = normalized * 0.45 + recencyScore * 0.25 + momentumScore * 0.2 + pairScore * 0.1;

    return {
      ...item,
      normalized,
      recencyScore,
      momentumScore,
      pairScore,
      score,
    };
  });

  const sortedByScore = [...enriched].sort((a, b) => b.score - a.score);
  const sortedByCold = [...enriched].sort((a, b) => a.score - b.score);
  const averageScore = enriched.reduce((sum, item) => sum + item.score, 0) / Math.max(enriched.length, 1);

  return {
    game,
    draws,
    frequencies: enriched,
    hotNumbers: sortedByScore.slice(0, 10).map((item) => item.number),
    coldNumbers: sortedByCold.slice(0, 10).map((item) => item.number),
    averageScore,
    updatedAt: new Date().toISOString(),
  };
}

function getStrategyWeights(strategy: StrategyType): { hotWeight: number; coldWeight: number; neutralWeight: number } {
  switch (strategy) {
    case 'hot':
      return { hotWeight: 1.15, coldWeight: 0.65, neutralWeight: 0.85 };
    case 'cold':
      return { hotWeight: 0.7, coldWeight: 1.2, neutralWeight: 0.85 };
    case 'balanced':
      return { hotWeight: 1, coldWeight: 0.95, neutralWeight: 1 };
  }
}

function createWeightedPool(context: PredictionContext, strategy: StrategyType): number[] {
  const hotSet = new Set<number>(context.hotNumbers);
  const coldSet = new Set<number>(context.coldNumbers);
  const weights = getStrategyWeights(strategy);
  const pool: number[] = [];

  context.frequencies.forEach((item) => {
    const baseWeight = Math.max(1, Math.round(item.score * 20));
    const hotMultiplier = hotSet.has(item.number) ? weights.hotWeight : 1;
    const coldMultiplier = coldSet.has(item.number) ? weights.coldWeight : 1;
    const neutralMultiplier = !hotSet.has(item.number) && !coldSet.has(item.number) ? weights.neutralWeight : 1;
    const totalWeight = Math.max(1, Math.round(baseWeight * hotMultiplier * coldMultiplier * neutralMultiplier));

    for (let index = 0; index < totalWeight; index += 1) {
      pool.push(item.number);
    }
  });

  return pool;
}

function pickUniqueNumbers(pool: number[], count: number): number[] {
  const selected = new Set<number>();
  let guard = 0;

  while (selected.size < count && guard < 500) {
    const candidate = pool[Math.floor(Math.random() * pool.length)] ?? 1;
    selected.add(candidate);
    guard += 1;
  }

  return [...selected].sort((a, b) => a - b);
}

export function createPredictedSet(
  game: GameType,
  strategy: StrategyType,
  context: PredictionContext
): PredictionInsights {
  const config = GAME_CONFIGS[game];
  const pool = createWeightedPool(context, strategy);
  const numbers = pickUniqueNumbers(pool, config.mainCount);
  const bonusNumber = Math.max(1, Math.min(config.bonusRange, Math.round(((Math.random() * 0.5) + 0.5) * config.bonusRange)));
  const confidence = Math.max(
    48,
    Math.min(
      86,
      Math.round(
        numbers.reduce((sum, number) => sum + (context.frequencies[number - 1]?.score ?? context.averageScore), 0) /
          Math.max(numbers.length, 1) *
          100
      )
    )
  );

  const reasons: string[] = [
    `${context.draws.length} recent live draws analyzed`,
    `Frequency, recency, momentum, and pair trends blended`,
    `${strategy.charAt(0).toUpperCase() + strategy.slice(1)} strategy bias applied`,
  ];

  const topSignals = numbers
    .map((number) => context.frequencies[number - 1])
    .filter((item): item is FrequencyData => Boolean(item))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => item.number);

  if (topSignals.length > 0) {
    reasons.push(`Top model signals include ${topSignals.join(', ')}`);
  }

  return {
    numbers,
    bonusNumber,
    confidence,
    reasons,
    strategy,
    source: context.draws.length > 0 ? 'live-ml' : 'fallback',
    generatedAt: new Date().toISOString(),
  };
}
