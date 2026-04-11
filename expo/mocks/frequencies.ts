import { GameType } from '@/types/lottery';

function generateFrequencies(max: number, seed: number): number[] {
  const freqs: number[] = [];
  for (let i = 0; i <= max; i++) {
    const base = Math.sin(i * seed + 0.5) * 0.5 + 0.5;
    const noise = Math.cos(i * 3.7 + seed) * 0.2;
    freqs.push(Math.max(0.05, Math.min(1, base + noise)));
  }
  return freqs;
}

const powerballFreqs = generateFrequencies(69, 1.23);
const megamillionsFreqs = generateFrequencies(70, 2.47);

export function getFrequencies(game: GameType): number[] {
  return game === 'powerball' ? powerballFreqs : megamillionsFreqs;
}

export function getHotNumbers(game: GameType, count: number = 10): number[] {
  const freqs = getFrequencies(game);
  return freqs
    .map((f, i) => ({ num: i, freq: f }))
    .filter(x => x.num > 0)
    .sort((a, b) => b.freq - a.freq)
    .slice(0, count)
    .map(x => x.num);
}

export function getColdNumbers(game: GameType, count: number = 10): number[] {
  const freqs = getFrequencies(game);
  return freqs
    .map((f, i) => ({ num: i, freq: f }))
    .filter(x => x.num > 0)
    .sort((a, b) => a.freq - b.freq)
    .slice(0, count)
    .map(x => x.num);
}
