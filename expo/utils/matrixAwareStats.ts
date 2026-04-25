import { GAME_CONFIGS } from '@/constants/games';
import type { GameType, LiveDraw } from '@/types/lottery';

export type MatrixEra = {
  id: string;
  label: string;
  startDate: string;
  mainCount: number;
  mainRange: number;
  bonusRange: number;
  note: string;
};

export type MatrixWindow = 'current' | 'last10' | 'last20' | 'last50' | 'last100' | 'all';

export type MatrixAwareStats = {
  game: GameType;
  era: MatrixEra;
  window: MatrixWindow;
  drawingsAnalyzed: number;
  hotNumbers: number[];
  coldNumbers: number[];
  lastDrawDate: string | null;
  summary: string;
};

export const MATRIX_ERAS: Record<GameType, MatrixEra[]> = {
  powerball: [
    {
      id: 'powerball-current-2015',
      label: 'Current Powerball Matrix',
      startDate: '2015-10-07',
      mainCount: 5,
      mainRange: 69,
      bonusRange: 26,
      note: 'Powerball current 5/69 + 1/26 matrix.',
    },
  ],
  megamillions: [
    {
      id: 'mega-current-2025',
      label: 'Current Mega Millions Matrix',
      startDate: '2025-04-08',
      mainCount: 5,
      mainRange: 70,
      bonusRange: 25,
      note: 'Mega Millions matrix changed on April 8, 2025; current-era stats should not mix older rules.',
    },
  ],
};

function getWindowLimit(window: MatrixWindow): number | null {
  switch (window) {
    case 'last10':
      return 10;
    case 'last20':
      return 20;
    case 'last50':
      return 50;
    case 'last100':
      return 100;
    case 'current':
    case 'all':
      return null;
  }
}

function byDrawDateDesc(left: LiveDraw, right: LiveDraw) {
  return new Date(right.drawDate).getTime() - new Date(left.drawDate).getTime();
}

export function getCurrentMatrixEra(game: GameType): MatrixEra {
  return MATRIX_ERAS[game][0];
}

export function filterDrawsForMatrixWindow(
  game: GameType,
  draws: LiveDraw[],
  window: MatrixWindow = 'current'
): LiveDraw[] {
  const era = getCurrentMatrixEra(game);
  const start = new Date(era.startDate).getTime();
  const sameGame = draws.filter((draw) => draw.game === game);
  const eraDraws =
    window === 'all'
      ? sameGame
      : sameGame.filter((draw) => new Date(draw.drawDate).getTime() >= start);
  const sorted = [...eraDraws].sort(byDrawDateDesc);
  const limit = getWindowLimit(window);
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
}

export function buildMatrixAwareStats(
  game: GameType,
  draws: LiveDraw[],
  window: MatrixWindow = 'current'
): MatrixAwareStats {
  const config = GAME_CONFIGS[game];
  const era = getCurrentMatrixEra(game);
  const scopedDraws = filterDrawsForMatrixWindow(game, draws, window);
  const counts = new Map<number, number>();

  for (let number = 1; number <= config.mainRange; number += 1) {
    counts.set(number, 0);
  }

  scopedDraws.forEach((draw) => {
    draw.numbers.forEach((number) => {
      counts.set(number, (counts.get(number) ?? 0) + 1);
    });
  });

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  const coldRanked = [...counts.entries()].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const drawingsAnalyzed = scopedDraws.length;

  return {
    game,
    era,
    window,
    drawingsAnalyzed,
    hotNumbers: ranked.slice(0, 10).map(([number]) => number),
    coldNumbers: coldRanked.slice(0, 10).map(([number]) => number),
    lastDrawDate: scopedDraws[0]?.drawDate ?? null,
    summary:
      drawingsAnalyzed > 0
        ? `Based on ${drawingsAnalyzed} drawings since ${era.startDate}.`
        : `No current-era ${config.name} drawings available yet.`,
  };
}
