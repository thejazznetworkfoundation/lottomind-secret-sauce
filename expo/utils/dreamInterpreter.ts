import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { findSymbolNumbers, getCategoryForSymbol } from '@/mocks/dreamData';
import { GAME_CONFIGS } from '@/constants/games';
import { GameType } from '@/types/lottery';

export interface DreamInterpretation {
  symbols: string[];
  meaning: string;
  emotions: string[];
  intensity: number;
}

export interface DreamResult {
  interpretation: DreamInterpretation;
  baseNumbers: number[];
  comboNumbers: number[];
  finalPick: number[];
  bonusNumber: number;
  symbolMap: { symbol: string; numbers: number[]; category: string }[];
  pick3: string[];
  pick4: string[];
}

const dreamSchema = z.object({
  symbols: z.array(z.string()).describe('Key dream symbols extracted from the dream description, e.g. water, money, snake'),
  meaning: z.string().describe('A concise 2-3 sentence interpretation of the dream meaning'),
  emotions: z.array(z.string()).describe('Primary emotions detected in the dream'),
  intensity: z.number().min(0).max(1).describe('Emotional intensity of the dream from 0 to 1'),
});

export async function interpretDream(
  dreamText: string,
  game: GameType
): Promise<DreamResult> {
  const config = GAME_CONFIGS[game];

  console.log('[DreamInterpreter] Interpreting dream for', game);
  console.log('[DreamInterpreter] Dream text:', dreamText.substring(0, 100));

  const interpretation = await generateObject({
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are a dream interpreter and lottery strategist. Analyze this dream and extract symbols, meaning, emotions, and intensity.

Dream: "${dreamText}"

Extract the key symbols (single words like water, money, snake, flying, etc.), provide a brief meaning, list the emotions, and rate the emotional intensity from 0 to 1.`,
          },
        ],
      },
    ],
    schema: dreamSchema,
  });

  console.log('[DreamInterpreter] AI interpretation:', JSON.stringify(interpretation));

  const symbolMap: { symbol: string; numbers: number[]; category: string }[] = [];
  let allNumbers: number[] = [];

  for (const symbol of interpretation.symbols) {
    const nums = findSymbolNumbers(symbol);
    const category = getCategoryForSymbol(symbol);
    if (nums.length > 0) {
      symbolMap.push({ symbol, numbers: nums, category });
      allNumbers.push(...nums);
    }
  }

  if (allNumbers.length === 0) {
    const hashNums = hashDreamToNumbers(dreamText, config.mainRange);
    allNumbers = hashNums;
    symbolMap.push({
      symbol: 'dream energy',
      numbers: hashNums,
      category: 'mystical',
    });
  }

  if (interpretation.intensity > 0.7) {
    allNumbers = allNumbers.map((n) => ((n * 2) % config.mainRange) + 1);
  }

  const uniqueBase = [...new Set(allNumbers)].filter(
    (n) => n >= 1 && n <= config.mainRange
  );

  const combos = allNumbers.flatMap((n) => [
    n,
    ((n + 7) % config.mainRange) + 1,
    ((n * 3) % config.mainRange) + 1,
  ]);
  const uniqueCombos = [...new Set(combos)].filter(
    (n) => n >= 1 && n <= config.mainRange
  );

  const pool = uniqueCombos.length >= config.mainCount ? uniqueCombos : uniqueBase;
  const finalPick: number[] = [];
  const used = new Set<number>();

  while (finalPick.length < config.mainCount && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const num = pool[idx];
    if (!used.has(num)) {
      used.add(num);
      finalPick.push(num);
    }
    if (used.size >= pool.length) break;
  }

  while (finalPick.length < config.mainCount) {
    const num = Math.floor(Math.random() * config.mainRange) + 1;
    if (!used.has(num)) {
      used.add(num);
      finalPick.push(num);
    }
  }

  finalPick.sort((a, b) => a - b);

  const emotionSeed = interpretation.emotions.join('').length;
  const bonusNumber = (emotionSeed % config.bonusRange) + 1;

  console.log('[DreamInterpreter] Final pick:', finalPick, 'Bonus:', bonusNumber);

  const pick3 = generateDigitPicks(3, allNumbers, interpretation, dreamText);
  const pick4 = generateDigitPicks(4, allNumbers, interpretation, dreamText);

  console.log('[DreamInterpreter] Pick 3:', pick3, 'Pick 4:', pick4);

  return {
    interpretation,
    baseNumbers: uniqueBase.slice(0, 10),
    comboNumbers: uniqueCombos.slice(0, 12),
    finalPick,
    bonusNumber,
    symbolMap,
    pick3,
    pick4,
  };
}

function generateDigitPicks(
  digitCount: number,
  symbolNumbers: number[],
  interpretation: DreamInterpretation,
  dreamText: string
): string[] {
  const maxVal = digitCount === 3 ? 999 : 9999;
  const results: string[] = [];
  const used = new Set<string>();

  const seedValues: number[] = [];
  for (const num of symbolNumbers) {
    seedValues.push(num);
  }
  for (const emotion of interpretation.emotions) {
    let emotionVal = 0;
    for (let i = 0; i < emotion.length; i++) {
      emotionVal += emotion.charCodeAt(i);
    }
    seedValues.push(emotionVal);
  }
  let textSeed = 0;
  for (let i = 0; i < dreamText.length; i++) {
    textSeed += dreamText.charCodeAt(i);
  }
  seedValues.push(textSeed);

  const intensityMultiplier = Math.max(1, Math.round(interpretation.intensity * 7));

  for (let i = 0; i < seedValues.length && results.length < 5; i++) {
    const base = seedValues[i];
    const transformed = Math.abs((base * intensityMultiplier + (i * 37)) % (maxVal + 1));
    const padded = String(transformed).padStart(digitCount, '0');
    if (!used.has(padded)) {
      used.add(padded);
      results.push(padded);
    }
  }

  for (let i = 0; i < seedValues.length - 1 && results.length < 5; i++) {
    const combined = Math.abs((seedValues[i] * seedValues[i + 1] + textSeed) % (maxVal + 1));
    const padded = String(combined).padStart(digitCount, '0');
    if (!used.has(padded)) {
      used.add(padded);
      results.push(padded);
    }
  }

  while (results.length < 3) {
    const fallback = Math.abs((textSeed * (results.length + 1) * 13) % (maxVal + 1));
    const padded = String(fallback).padStart(digitCount, '0');
    if (!used.has(padded)) {
      used.add(padded);
      results.push(padded);
    }
  }

  return results.slice(0, digitCount === 3 ? 3 : 5);
}

function hashDreamToNumbers(text: string, maxRange: number): number[] {
  const nums: number[] = [];
  for (let i = 0; i < text.length && nums.length < 6; i += 3) {
    const code = text.charCodeAt(i) + (text.charCodeAt(i + 1) || 0);
    const num = (code % maxRange) + 1;
    if (!nums.includes(num)) {
      nums.push(num);
    }
  }
  return nums;
}
