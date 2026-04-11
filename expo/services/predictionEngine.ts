export interface SmartPrediction {
  numbers: number[];
  confidence: number;
  hotDigits: number[];
  coldDigits: number[];
  reasoning: string[];
}

interface WeightEntry {
  number: number;
  weight: number;
}

function buildWeights(history: number[], maxRange: number): WeightEntry[] {
  const freq = new Map<number, number>();
  for (let i = 1; i <= maxRange; i++) freq.set(i, 0);

  history.forEach((n) => {
    freq.set(n, (freq.get(n) ?? 0) + 1);
  });

  return Array.from(freq.entries())
    .map(([number, weight]) => ({ number, weight }))
    .sort((a, b) => b.weight - a.weight);
}

export function generateSmartNumbers(
  history: number[],
  count: number = 5,
  maxRange: number = 69,
): SmartPrediction {
  const weights = buildWeights(history, maxRange);
  const totalDraws = Math.max(Math.floor(history.length / count), 1);

  const hotDigits = weights.slice(0, 10).map((w) => w.number);
  const coldDigits = weights.slice(-10).map((w) => w.number);

  const pool: number[] = [];
  weights.forEach((w) => {
    const tickets = Math.max(1, Math.round((w.weight / totalDraws) * 20) + 1);
    for (let i = 0; i < tickets; i++) {
      pool.push(w.number);
    }
  });

  if (pool.length === 0) {
    for (let i = 1; i <= maxRange; i++) pool.push(i);
  }

  const selected = new Set<number>();
  let guard = 0;
  while (selected.size < count && guard < 1000) {
    const pick = pool[Math.floor(Math.random() * pool.length)] ?? 1;
    selected.add(pick);
    guard++;
  }

  const numbers = Array.from(selected).sort((a, b) => a - b);

  const avgWeight = weights.reduce((s, w) => s + w.weight, 0) / Math.max(weights.length, 1);
  const selectedAvgWeight =
    numbers.reduce((s, n) => s + (weights.find((w) => w.number === n)?.weight ?? 0), 0) /
    Math.max(numbers.length, 1);
  const confidence = Math.min(
    88,
    Math.max(45, Math.round((selectedAvgWeight / Math.max(avgWeight, 1)) * 65)),
  );

  const hotInSet = numbers.filter((n) => hotDigits.includes(n)).length;
  const coldInSet = numbers.filter((n) => coldDigits.includes(n)).length;

  const reasoning: string[] = [
    `${totalDraws} historical draws analyzed`,
    `Frequency-weighted selection from ${pool.length} candidate pool`,
    `${hotInSet} hot number${hotInSet !== 1 ? 's' : ''} and ${coldInSet} cold number${coldInSet !== 1 ? 's' : ''} in set`,
    `Top trending: ${hotDigits.slice(0, 3).join(', ')}`,
  ];

  return {
    numbers,
    confidence,
    hotDigits,
    coldDigits,
    reasoning,
  };
}

export function generateDigitPicks(
  history: number[],
  mode: 'hot' | 'balanced' | 'random' = 'balanced',
): { pick3: string; pick4: string; reasoning: string[] } {
  const digitFreq = new Map<number, number>();
  for (let d = 0; d <= 9; d++) digitFreq.set(d, 0);

  history.forEach((n) => {
    const digits = String(n).split('').map(Number);
    digits.forEach((d) => {
      if (!isNaN(d)) digitFreq.set(d, (digitFreq.get(d) ?? 0) + 1);
    });
  });

  const sorted = Array.from(digitFreq.entries()).sort((a, b) => b[1] - a[1]);
  const hotDigits = sorted.slice(0, 5).map(([d]) => d);
  const coldDigits = sorted.slice(-5).map(([d]) => d);

  let p3: number[];
  let p4: number[];

  if (mode === 'hot') {
    p3 = hotDigits.slice(0, 3);
    p4 = hotDigits.slice(0, 4);
  } else if (mode === 'balanced') {
    p3 = [hotDigits[0], coldDigits[0], hotDigits[2]];
    p4 = [hotDigits[0], coldDigits[0], hotDigits[1], coldDigits[1]];
  } else {
    p3 = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10));
    p4 = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
  }

  const reasoning = [
    `Mode: ${mode}`,
    `Hot digits: ${hotDigits.join(', ')}`,
    `Cold digits: ${coldDigits.join(', ')}`,
    `${history.length} numbers analyzed for digit frequency`,
  ];

  return {
    pick3: p3.join(''),
    pick4: p4.join(''),
    reasoning,
  };
}

export function storeResultHistory<T>(history: T[], newResult: T, maxSize: number = 50): T[] {
  return [newResult, ...history].slice(0, maxSize);
}
