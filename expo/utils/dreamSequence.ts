export type EngineMode = 'pattern' | 'rhythm' | 'dream';

export interface DreamSequenceResult {
  inputNumbers: number[];
  modifier: number;
  differences: number[];
  patternType: 'micro' | 'macro' | 'mixed';
  baseSequence: number[];
  modifiedSequence: number[];
  hotZone: number[];
  confidence: number;
  enginesUsed: EngineMode[];
}

const MICRO_JUMPS = [6, 7, 9, 5, 8];
const MACRO_JUMPS = [12, 18, 22, 29, 15, 25];

function isLargeJump(n: number): boolean {
  return Math.abs(n) > 15;
}

function detectPatternType(diffs: number[]): 'micro' | 'macro' | 'mixed' {
  const largeCount = diffs.filter(d => isLargeJump(d)).length;
  const ratio = largeCount / Math.max(diffs.length, 1);
  if (ratio > 0.6) return 'macro';
  if (ratio < 0.3) return 'micro';
  return 'mixed';
}

function generatePatternSequence(numbers: number[], diffs: number[]): number[] {
  let last = numbers[numbers.length - 1];
  const sequence: number[] = [];
  const workingDiffs = [...diffs];

  for (let i = 0; i < 4; i++) {
    const lastDiff = workingDiffs[workingDiffs.length - 1];
    let nextDiff: number;

    if (isLargeJump(lastDiff)) {
      nextDiff = MICRO_JUMPS[i % MICRO_JUMPS.length];
    } else {
      nextDiff = MACRO_JUMPS[i % MACRO_JUMPS.length];
    }

    const jitter = Math.floor(Math.random() * 3) - 1;
    nextDiff += jitter;

    const nextNum = last + nextDiff;
    sequence.push(nextNum);
    workingDiffs.push(nextDiff);
    last = nextNum;
  }

  return sequence;
}

const RHYTHM_GROWTH = [3, 5, 4, 6];
const RHYTHM_LEAP = [14, 19, 11, 17];

function generateRhythmSequence(numbers: number[], diffs: number[]): number[] {
  let last = numbers[numbers.length - 1];
  const sequence: number[] = [];
  const avgDiff = diffs.reduce((s, d) => s + Math.abs(d), 0) / Math.max(diffs.length, 1);
  const startWithGrowth = avgDiff > 12;

  for (let i = 0; i < 4; i++) {
    const isGrowthPhase = startWithGrowth ? i % 2 === 0 : i % 2 !== 0;
    const pool = isGrowthPhase ? RHYTHM_GROWTH : RHYTHM_LEAP;
    let step = pool[i % pool.length];
    const jitter = Math.floor(Math.random() * 3) - 1;
    step += jitter;
    const nextNum = last + step;
    sequence.push(nextNum);
    last = nextNum;
  }

  return sequence;
}

function applyDreamModifier(sequence: number[], modifier: number): number[] {
  return sequence.map(n => n + modifier);
}

function mergeSequences(sequences: number[][]): number[] {
  if (sequences.length === 0) return [];
  if (sequences.length === 1) return sequences[0];

  const merged: number[] = [];
  const len = Math.max(...sequences.map(s => s.length));

  for (let i = 0; i < len; i++) {
    let sum = 0;
    let count = 0;
    for (const seq of sequences) {
      if (i < seq.length) {
        sum += seq[i];
        count++;
      }
    }
    merged.push(Math.round(sum / count));
  }

  return merged;
}

export function generateDreamSequence(
  numbers: number[],
  modifier: number = 1,
  engines: EngineMode[] = ['pattern', 'rhythm', 'dream']
): DreamSequenceResult {
  console.log('[DreamSequence] Input:', numbers, 'Modifier:', modifier);

  if (numbers.length < 2) {
    const fallback = numbers.length === 1 ? numbers[0] : 10;
    const base = [fallback + 7, fallback + 16, fallback + 23, fallback + 52];
    return {
      inputNumbers: numbers,
      modifier,
      differences: [],
      patternType: 'mixed',
      baseSequence: base,
      modifiedSequence: base.map(n => n + modifier),
      hotZone: base.slice(0, 2),
      confidence: 45,
      enginesUsed: engines,
    };
  }

  const activeEngines = engines.length > 0 ? engines : (['pattern', 'rhythm', 'dream'] as EngineMode[]);
  console.log('[DreamSequence] Active engines:', activeEngines);

  const diffs: number[] = [];
  for (let i = 1; i < numbers.length; i++) {
    diffs.push(numbers[i] - numbers[i - 1]);
  }

  console.log('[DreamSequence] Differences:', diffs);

  const patternType = detectPatternType(diffs);
  console.log('[DreamSequence] Pattern type:', patternType);

  const subSequences: number[][] = [];

  if (activeEngines.includes('pattern')) {
    const patternSeq = generatePatternSequence(numbers, diffs);
    console.log('[DreamSequence] Pattern sequence:', patternSeq);
    subSequences.push(patternSeq);
  }

  if (activeEngines.includes('rhythm')) {
    const rhythmSeq = generateRhythmSequence(numbers, diffs);
    console.log('[DreamSequence] Rhythm sequence:', rhythmSeq);
    subSequences.push(rhythmSeq);
  }

  if (subSequences.length === 0) {
    const fallbackSeq = generatePatternSequence(numbers, diffs);
    subSequences.push(fallbackSeq);
  }

  const sequence = mergeSequences(subSequences);

  const useDreamMod = activeEngines.includes('dream');
  const modified = useDreamMod ? applyDreamModifier(sequence, modifier) : sequence.map(n => n);

  const allNums = [...sequence, ...modified];
  const freqMap = new Map<number, number>();
  for (const n of allNums) {
    freqMap.set(n, (freqMap.get(n) ?? 0) + 1);
  }
  const hotZone = [...freqMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  const avgDiff = diffs.reduce((s, d) => s + Math.abs(d), 0) / Math.max(diffs.length, 1);
  const patternStrength = Math.min(1, avgDiff / 30);
  const baseConfidence = Math.max(52, Math.min(89, Math.round(55 + patternStrength * 34)));
  const engineBonus = activeEngines.length > 1 ? activeEngines.length * 3 : 0;
  const confidence = Math.min(95, baseConfidence + engineBonus);

  console.log('[DreamSequence] Base:', sequence, 'Modified:', modified, 'Confidence:', confidence, 'Engines:', activeEngines);

  return {
    inputNumbers: numbers,
    modifier,
    differences: diffs,
    patternType,
    baseSequence: sequence,
    modifiedSequence: modified,
    hotZone,
    confidence,
    enginesUsed: activeEngines,
  };
}

export function generateFromDreamNumbers(
  dreamBaseNumbers: number[],
  modifier: number = 1,
  engines: EngineMode[] = ['pattern', 'rhythm', 'dream']
): DreamSequenceResult {
  const sorted = [...dreamBaseNumbers].sort((a, b) => a - b);
  const input = sorted.length >= 2 ? sorted.slice(0, 5) : sorted;
  return generateDreamSequence(input, modifier, engines);
}
