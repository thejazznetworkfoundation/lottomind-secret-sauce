import type { GameType } from '@/types/lottery';

export type PsychicReadingInput = {
  prompt: string;
  dreamText?: string;
  userName?: string;
  birthDate?: string;
  game?: GameType | 'pick3' | 'pick4';
};

export type PsychicReadingResult = {
  title: string;
  message: string;
  luckCycle: 'Rising' | 'Neutral' | 'Cooling';
  energyScore: number;
  luckyColor: string;
  bestPlayWindow: string;
  suggestedNumbers: number[];
  bonusNumber?: number;
  pick3: string;
  pick4: string;
  explanation: string;
  disclaimer: string;
};

const DISCLAIMER =
  'For entertainment only. Lottery outcomes are random. No reading, prediction, or number suggestion can guarantee a win.';

function hashSeed(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function next(seed: number): [number, number] {
  const nextSeed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return [nextSeed, nextSeed / 0xffffffff];
}

function pickUnique(seed: number, count: number, max: number): [number[], number] {
  const selected = new Set<number>();
  let currentSeed = seed;
  let guard = 0;
  while (selected.size < count && guard < 500) {
    const [updatedSeed, value] = next(currentSeed);
    currentSeed = updatedSeed;
    selected.add(Math.floor(value * max) + 1);
    guard += 1;
  }
  return [[...selected].sort((a, b) => a - b), currentSeed];
}

function digits(seed: number, count: number): [string, number] {
  let currentSeed = seed;
  let output = '';
  for (let index = 0; index < count; index += 1) {
    const [updatedSeed, value] = next(currentSeed);
    currentSeed = updatedSeed;
    output += String(Math.floor(value * 10));
  }
  return [output, currentSeed];
}

export function generatePsychicReading(input: PsychicReadingInput): PsychicReadingResult {
  const dateKey = new Date().toISOString().slice(0, 10);
  const source = [input.prompt, input.dreamText, input.userName, input.birthDate, input.game, dateKey]
    .filter(Boolean)
    .join('|');
  let seed = hashSeed(source || dateKey);
  const game = input.game ?? 'powerball';
  const isMega = game === 'megamillions';
  const mainRange = isMega ? 70 : 69;
  const bonusRange = isMega ? 25 : 26;
  const [suggestedNumbers, numberSeed] = pickUnique(seed, 5, mainRange);
  seed = numberSeed;
  const [bonusSeed, bonusRoll] = next(seed);
  seed = bonusSeed;
  const [pick3, pick3Seed] = digits(seed, 3);
  seed = pick3Seed;
  const [pick4] = digits(seed, 4);
  const energyScore = 35 + (hashSeed(`${source}:energy`) % 61);
  const luckCycle = energyScore >= 70 ? 'Rising' : energyScore >= 45 ? 'Neutral' : 'Cooling';
  const colors = ['Gold', 'Purple', 'Emerald', 'Silver', 'Amber', 'Blue'];
  const windows = ['Morning focus', 'Midday reset', 'Evening reflection', 'Next draw window'];
  const luckyColor = colors[hashSeed(`${source}:color`) % colors.length];
  const bestPlayWindow = windows[hashSeed(`${source}:window`) % windows.length];

  return {
    title: `${luckCycle} Energy Reading`,
    message:
      'This symbolic reading reflects mood, timing, and number inspiration. Treat it as entertainment, not certainty.',
    luckCycle,
    energyScore,
    luckyColor,
    bestPlayWindow,
    suggestedNumbers,
    bonusNumber: Math.floor(bonusRoll * bonusRange) + 1,
    pick3,
    pick4,
    explanation:
      'LottoMind blended your prompt, today’s date, and game rules into a deterministic pattern reflection for inspiration.',
    disclaimer: DISCLAIMER,
  };
}

export { DISCLAIMER as PSYCHIC_DISCLAIMER };
