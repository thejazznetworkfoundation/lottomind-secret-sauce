import { GameType, StrategyType } from '@/types/lottery';
import { GAME_CONFIGS } from '@/constants/games';
import { getHotNumbers, getColdNumbers } from '@/mocks/frequencies';

export function generateNumbers(
  game: GameType,
  strategy: StrategyType
): { numbers: number[]; bonusNumber: number } {
  const config = GAME_CONFIGS[game];
  const hot = getHotNumbers(game, 15);
  const cold = getColdNumbers(game, 15);

  let pool: number[] = [];

  switch (strategy) {
    case 'hot':
      pool = [...hot];
      for (let i = 1; i <= config.mainRange; i++) {
        if (!pool.includes(i)) pool.push(i);
      }
      break;
    case 'cold':
      pool = [...cold];
      for (let i = 1; i <= config.mainRange; i++) {
        if (!pool.includes(i)) pool.push(i);
      }
      break;
    case 'balanced':
      pool = [...hot.slice(0, 8), ...cold.slice(0, 7)];
      for (let i = 1; i <= config.mainRange; i++) {
        if (!pool.includes(i)) pool.push(i);
      }
      break;
  }

  const numbers: number[] = [];
  const usedIndices = new Set<number>();

  while (numbers.length < config.mainCount) {
    const weightedIdx = Math.floor(Math.random() * Math.min(pool.length, strategy === 'balanced' ? pool.length : 25));
    const idx = weightedIdx % pool.length;
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      numbers.push(pool[idx]);
    }
  }

  numbers.sort((a, b) => a - b);

  const bonusNumber = Math.floor(Math.random() * config.bonusRange) + 1;

  return { numbers, bonusNumber };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
