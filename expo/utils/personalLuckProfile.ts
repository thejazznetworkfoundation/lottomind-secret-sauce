import { GAME_CONFIGS } from '@/constants/games';
import type { GameType, GeneratedSet } from '@/types/lottery';

export const LUCK_PROFILE_DISCLAIMER =
  'For entertainment only. Lottery outcomes are random. No reading, profile, or number suggestion can guarantee a win.';

export type PersonalLuckProfileInput = {
  name: string;
  birthDate: string;
  currentGame: GameType;
  history: GeneratedSet[];
  totalGenerations: number;
  totalShares: number;
  streakDays: number;
  xp: number;
  credits: number;
};

export type PersonalLuckProfile = {
  fingerprintTitle: string;
  evolutionStage: string;
  energySignature: string;
  nameNumber: number;
  birthPathNumber: number;
  luckyNumbers: number[];
  bonusNumber: number;
  pick3: string;
  pick4: string;
  hotStreak: string;
  coldStreak: string;
  behaviorSignal: string;
  bestPlayWindow: string;
  explanation: string;
  disclaimer: string;
};

function hashText(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function next(seed: number): [number, number] {
  const nextSeed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return [nextSeed, nextSeed / 0xffffffff];
}

function reduceNumber(value: number) {
  let nextValue = Math.abs(value);
  while (nextValue > 9) {
    nextValue = String(nextValue)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return nextValue || 9;
}

function nameToNumber(name: string) {
  const total = name
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .split('')
    .reduce((sum, letter) => sum + letter.charCodeAt(0) - 96, 0);
  return reduceNumber(total);
}

function birthDateToNumber(birthDate: string) {
  const total = birthDate
    .replace(/\D/g, '')
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);
  return reduceNumber(total);
}

function mostUsedNumbers(history: GeneratedSet[]) {
  const counts = new Map<number, number>();
  history.forEach((set) => {
    set.numbers.forEach((number) => counts.set(number, (counts.get(number) ?? 0) + 1));
    counts.set(set.bonusNumber, (counts.get(set.bonusNumber) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .map(([number]) => number);
}

function pickUnique(seed: number, count: number, max: number, anchors: number[]) {
  const selected = new Set<number>();
  anchors.forEach((number) => {
    if (number >= 1 && number <= max && selected.size < count) {
      selected.add(number);
    }
  });

  let currentSeed = seed;
  while (selected.size < count) {
    const [updatedSeed, value] = next(currentSeed);
    currentSeed = updatedSeed;
    selected.add(Math.floor(value * max) + 1);
  }

  return [...selected].sort((a, b) => a - b);
}

function buildDigits(seed: number, count: number) {
  let currentSeed = seed;
  let output = '';
  for (let i = 0; i < count; i += 1) {
    const [updatedSeed, value] = next(currentSeed);
    currentSeed = updatedSeed;
    output += String(Math.floor(value * 10));
  }
  return output;
}

function getRecentActivity(history: GeneratedSet[]) {
  const now = Date.now();
  return history.filter((set) => now - new Date(set.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000).length;
}

export function generatePersonalLuckProfile(input: PersonalLuckProfileInput): PersonalLuckProfile {
  const config = GAME_CONFIGS[input.currentGame];
  const nameNumber = nameToNumber(input.name || 'LottoMind');
  const birthPathNumber = birthDateToNumber(input.birthDate || new Date().toISOString().slice(0, 10));
  const historyNumbers = mostUsedNumbers(input.history).slice(0, 4);
  const recentActivity = getRecentActivity(input.history);
  const behaviorSeed = `${input.totalGenerations}|${input.totalShares}|${input.streakDays}|${input.xp}|${input.credits}|${input.history.length}`;
  const seed = hashText(`${input.name}|${input.birthDate}|${input.currentGame}|${behaviorSeed}|${historyNumbers.join(',')}`);
  const anchors = [
    nameNumber,
    birthPathNumber,
    ...historyNumbers,
    reduceNumber(input.streakDays + input.totalGenerations),
  ];
  const luckyNumbers = pickUnique(seed, config.mainCount, config.mainRange, anchors);
  const bonusNumber = ((hashText(`${seed}:bonus`) + birthPathNumber) % config.bonusRange) + 1;
  const pick3 = buildDigits(hashText(`${seed}:pick3:${input.streakDays}`), 3);
  const pick4 = buildDigits(hashText(`${seed}:pick4:${input.totalGenerations}`), 4);
  const energyIndex = (nameNumber + birthPathNumber + input.streakDays + recentActivity) % 4;
  const energySignatures = ['Gold Builder', 'Purple Intuitive', 'Emerald Pattern Seeker', 'Silver Reset Cycle'];
  const windows = ['Morning focus', 'Midday reset', 'Evening review', 'Next draw window'];
  const hotStreak =
    input.streakDays >= 7
      ? `${input.streakDays}-day hot streak: your profile is in an active learning cycle.`
      : recentActivity >= 3
        ? `${recentActivity} recent pick sessions: short-term heat is building.`
        : 'No major hot streak yet: build consistency with saved picks and mindful sessions.';
  const coldStreak =
    input.history.length === 0
      ? 'Cold start: no past picks yet, so LottoMind is using name and birthdate anchors.'
      : recentActivity === 0
        ? 'Cooling streak: no recent saved picks in the last 7 days.'
        : 'No cold streak detected: recent activity is keeping the fingerprint fresh.';
  const evolutionStage =
    input.history.length >= 20 || input.totalGenerations >= 50
      ? 'Mature fingerprint'
      : input.history.length >= 5 || input.totalGenerations >= 12
        ? 'Evolving fingerprint'
        : 'New fingerprint';

  return {
    fingerprintTitle: `${input.name.trim() || 'LottoMind'} Luck Fingerprint`,
    evolutionStage,
    energySignature: energySignatures[energyIndex],
    nameNumber,
    birthPathNumber,
    luckyNumbers,
    bonusNumber,
    pick3,
    pick4,
    hotStreak,
    coldStreak,
    behaviorSignal: `${input.totalGenerations} generations, ${input.totalShares} shares, ${input.history.length} saved pick sessions analyzed.`,
    bestPlayWindow: windows[(seed + input.streakDays) % windows.length],
    explanation:
      'This profile blends name numerology, birthdate path, app behavior, and past pick patterns into evolving number inspiration.',
    disclaimer: LUCK_PROFILE_DISCLAIMER,
  };
}
