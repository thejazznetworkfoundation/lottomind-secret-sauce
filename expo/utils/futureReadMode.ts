import type { GameType } from '@/types/lottery';
import {
  generatePsychicReading,
  type PsychicReadingResult,
  PSYCHIC_DISCLAIMER,
} from '@/utils/psychicEngine';

export type FutureConfidenceLevel = 'Low' | 'Medium' | 'High';

export type FutureReadInput = {
  question: string;
  game: GameType;
  userName?: string;
  birthDate?: string;
  pastPickSignature?: string;
};

export type FutureReadResult = {
  title: string;
  symbolicReading: string;
  emotionalTone: string;
  timingSuggestion: string;
  confidenceLevel: FutureConfidenceLevel;
  confidenceScore: number;
  suggestedNumbers: number[];
  bonusNumber?: number;
  pick3: string;
  pick4: string;
  strategy: string;
  reading: PsychicReadingResult;
  disclaimer: string;
};

export type FutureWeekForecastDay = {
  dateLabel: string;
  timingSuggestion: string;
  confidenceLevel: FutureConfidenceLevel;
  energyScore: number;
  luckyColor: string;
  suggestedNumbers: number[];
  pick3: string;
  pick4: string;
  strategy: string;
};

export type FutureWeekForecast = {
  title: string;
  generatedAt: string;
  days: FutureWeekForecastDay[];
  disclaimer: string;
};

function hashSeed(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function todayKey(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function confidenceFromSeed(seed: number): { level: FutureConfidenceLevel; score: number } {
  const score = 35 + (seed % 61);
  if (score >= 76) return { level: 'High', score };
  if (score >= 55) return { level: 'Medium', score };
  return { level: 'Low', score };
}

function pickBySeed<T>(items: T[], seed: number): T {
  return items[seed % items.length];
}

function buildStrategy(seed: number, reading: PsychicReadingResult): string {
  const strategies = [
    `Use a balanced line with ${reading.suggestedNumbers.slice(0, 2).join(' and ')} as anchors, then cap the play to your normal budget.`,
    `Play slowly: one main line, one Pick 3/4 idea, and save the rest of the inspiration for the next draw.`,
    `Blend hot/cold thinking with the symbolic line: keep ${reading.bonusNumber ?? reading.suggestedNumbers[0]} as the bonus focus and avoid chasing losses.`,
    `Use this as a pattern reflection only: compare the numbers against your wallet before deciding whether to play today.`,
  ];
  return pickBySeed(strategies, seed);
}

export function generateFutureRead(input: FutureReadInput): FutureReadResult {
  const question = input.question.trim() || 'Should I play today?';
  const seedSource = [
    question,
    input.game,
    input.userName,
    input.birthDate,
    input.pastPickSignature,
    todayKey(),
  ]
    .filter(Boolean)
    .join('|');
  const seed = hashSeed(seedSource);
  const reading = generatePsychicReading({
    prompt: `future read mode: ${question}`,
    userName: input.userName,
    birthDate: input.birthDate,
    game: input.game,
  });
  const confidence = confidenceFromSeed(hashSeed(`${seedSource}:confidence`));
  const emotionalTones = [
    'Grounded optimism',
    'Patient curiosity',
    'Cautious confidence',
    'Restless momentum',
    'Calm focus',
  ];
  const timingOptions = [
    'Next 3 draws',
    'Next 2 evening windows',
    'Next draw only',
    'Wait one draw, then reassess',
    'This week, after your saved-number review',
  ];
  const tone = pickBySeed(emotionalTones, seed);
  const timingSuggestion = pickBySeed(timingOptions, hashSeed(`${seedSource}:timing`));

  return {
    title: 'Future Read Mode',
    symbolicReading:
      `Your question points toward ${reading.luckCycle.toLowerCase()} energy with ${tone.toLowerCase()}. ` +
      'Use this as symbolic guidance, not a prediction of an outcome.',
    emotionalTone: tone,
    timingSuggestion,
    confidenceLevel: confidence.level,
    confidenceScore: confidence.score,
    suggestedNumbers: reading.suggestedNumbers,
    bonusNumber: reading.bonusNumber,
    pick3: reading.pick3,
    pick4: reading.pick4,
    strategy: buildStrategy(seed, reading),
    reading,
    disclaimer: PSYCHIC_DISCLAIMER,
  };
}

export function generateFutureWeekForecast(input: FutureReadInput): FutureWeekForecast {
  const days = Array.from({ length: 7 }, (_, index) => {
    const result = generateFutureRead({
      ...input,
      question: `${input.question || 'future week forecast'} ${todayKey(index)}`,
    });

    return {
      dateLabel: todayKey(index),
      timingSuggestion: result.timingSuggestion,
      confidenceLevel: result.confidenceLevel,
      energyScore: result.reading.energyScore,
      luckyColor: result.reading.luckyColor,
      suggestedNumbers: result.suggestedNumbers,
      pick3: result.pick3,
      pick4: result.pick4,
      strategy: result.strategy,
    };
  });

  return {
    title: '7-Day Future Forecast',
    generatedAt: new Date().toISOString(),
    days,
    disclaimer: PSYCHIC_DISCLAIMER,
  };
}
