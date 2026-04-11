export interface WordSearchPuzzle {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  gridSize: number;
  words: string[];
  rewardCredits: number;
}

function generateGrid(size: number, words: string[]): string[][] {
  const grid: string[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => '')
  );

  const directions: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [0, -1],
    [1, -1],
  ];

  const placed: { word: string; startRow: number; startCol: number; dr: number; dc: number }[] = [];

  for (const word of words) {
    let attempts = 0;
    let didPlace = false;
    while (attempts < 100 && !didPlace) {
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
      const maxRow = size - (dr === 0 ? 1 : word.length);
      const maxCol = size - (dc === 0 ? 1 : dc > 0 ? word.length : 0);
      const minCol = dc < 0 ? word.length - 1 : 0;

      if (maxRow < 0 || maxCol < minCol) {
        attempts++;
        continue;
      }

      const startRow = Math.floor(Math.random() * (maxRow + 1));
      const startCol = minCol + Math.floor(Math.random() * (maxCol - minCol + 1));

      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = startRow + dr * i;
        const c = startCol + dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size) {
          canPlace = false;
          break;
        }
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          grid[startRow + dr * i][startCol + dc * i] = word[i];
        }
        placed.push({ word, startRow, startCol, dr, dc });
        didPlace = true;
      }
      attempts++;
    }
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = letters[Math.floor(Math.random() * 26)];
      }
    }
  }

  return grid;
}

export function buildWordSearchGrid(puzzle: WordSearchPuzzle): {
  grid: string[][];
  wordPositions: Map<string, { row: number; col: number }[]>;
} {
  const seed = puzzle.id;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }

  const origRandom = Math.random;
  let state = Math.abs(hash) || 1;
  Math.random = () => {
    state = (state * 1664525 + 1013904223) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  const grid: string[][] = Array.from({ length: puzzle.gridSize }, () =>
    Array.from({ length: puzzle.gridSize }, () => '')
  );

  const directions: [number, number][] = [
    [0, 1], [1, 0], [1, 1], [0, -1], [1, -1], [-1, 0], [-1, 1],
  ];

  const wordPositions = new Map<string, { row: number; col: number }[]>();

  for (const word of puzzle.words) {
    let attempts = 0;
    let didPlace = false;
    while (attempts < 200 && !didPlace) {
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
      const startRow = Math.floor(Math.random() * puzzle.gridSize);
      const startCol = Math.floor(Math.random() * puzzle.gridSize);

      let canPlace = true;
      const positions: { row: number; col: number }[] = [];
      for (let i = 0; i < word.length; i++) {
        const r = startRow + dr * i;
        const c = startCol + dc * i;
        if (r < 0 || r >= puzzle.gridSize || c < 0 || c >= puzzle.gridSize) {
          canPlace = false;
          break;
        }
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
        positions.push({ row: r, col: c });
      }

      if (canPlace && positions.length === word.length) {
        for (let i = 0; i < word.length; i++) {
          grid[positions[i].row][positions[i].col] = word[i];
        }
        wordPositions.set(word, positions);
        didPlace = true;
      }
      attempts++;
    }
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < puzzle.gridSize; r++) {
    for (let c = 0; c < puzzle.gridSize; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = letters[Math.floor(Math.random() * 26)];
      }
    }
  }

  Math.random = origRandom;

  return { grid, wordPositions };
}

export const WORD_SEARCH_PUZZLES: WordSearchPuzzle[] = [
  {
    id: 'ws-1',
    title: 'Lottery Lingo',
    difficulty: 'Easy',
    gridSize: 10,
    words: ['JACKPOT', 'TICKET', 'DRAW', 'PRIZE', 'LOTTO', 'BALLS', 'ODDS', 'WIN'],
    rewardCredits: 10,
  },
  {
    id: 'ws-2',
    title: 'Big Money',
    difficulty: 'Easy',
    gridSize: 10,
    words: ['CASH', 'BONUS', 'MEGA', 'POWER', 'LUCKY', 'GOLD', 'RICH', 'COIN'],
    rewardCredits: 10,
  },
  {
    id: 'ws-3',
    title: 'Number Crunch',
    difficulty: 'Medium',
    gridSize: 12,
    words: ['FREQUENCY', 'PATTERN', 'RANDOM', 'TREND', 'MODEL', 'DATA', 'PREDICT', 'SCORE', 'HEAT'],
    rewardCredits: 20,
  },
  {
    id: 'ws-4',
    title: 'Strategy Zone',
    difficulty: 'Medium',
    gridSize: 12,
    words: ['BALANCED', 'STREAK', 'WHEEL', 'SYSTEM', 'QUICK', 'POOL', 'SMART', 'BLEND', 'PICK'],
    rewardCredits: 20,
  },
  {
    id: 'ws-5',
    title: 'Dream Oracle',
    difficulty: 'Medium',
    gridSize: 12,
    words: ['DREAM', 'SYMBOL', 'ORACLE', 'ZODIAC', 'MOON', 'STAR', 'FATE', 'SIGN', 'AURA', 'LUCK'],
    rewardCredits: 20,
  },
  {
    id: 'ws-6',
    title: 'Powerball Pro',
    difficulty: 'Hard',
    gridSize: 14,
    words: ['POWERBALL', 'ANNUITY', 'MULTIPLIER', 'ROLLOVER', 'JACKPOT', 'TICKET', 'DRAWING', 'WINNER', 'RANDOM', 'COMBO'],
    rewardCredits: 30,
  },
  {
    id: 'ws-7',
    title: 'Mega Challenge',
    difficulty: 'Hard',
    gridSize: 14,
    words: ['MEGAMILLIONS', 'MEGAPLIER', 'BARCODE', 'SCANNER', 'DIGITAL', 'RECEIPT', 'VENDOR', 'CLAIM', 'PRIZE', 'TRUST'],
    rewardCredits: 30,
  },
  {
    id: 'ws-8',
    title: 'Lucky Charms',
    difficulty: 'Easy',
    gridSize: 10,
    words: ['CLOVER', 'PENNY', 'SEVEN', 'CHARM', 'HORSE', 'WISH', 'HOPE', 'FATE'],
    rewardCredits: 10,
  },
  {
    id: 'ws-9',
    title: 'AI Brain',
    difficulty: 'Medium',
    gridSize: 12,
    words: ['NEURAL', 'SIGNAL', 'CORPUS', 'TRAIN', 'BATCH', 'EPOCH', 'LAYER', 'LEARN', 'DEEP'],
    rewardCredits: 20,
  },
  {
    id: 'ws-10',
    title: 'World Lotteries',
    difficulty: 'Hard',
    gridSize: 14,
    words: ['EUROMILLIONS', 'GORDO', 'NATIONAL', 'FLORIDA', 'SCRATCH', 'SYNDICATE', 'LEGEND', 'RECORD', 'BONUS', 'AUDIT'],
    rewardCredits: 30,
  },
  {
    id: 'ws-11',
    title: 'Math Genius',
    difficulty: 'Medium',
    gridSize: 12,
    words: ['PRIME', 'SIGMA', 'FACTOR', 'MEDIAN', 'NORMAL', 'PROOF', 'GRAPH', 'RATIO', 'CURVE'],
    rewardCredits: 20,
  },
  {
    id: 'ws-12',
    title: 'Casino Night',
    difficulty: 'Easy',
    gridSize: 10,
    words: ['POKER', 'CHIPS', 'DICE', 'CARD', 'DEAL', 'SLOT', 'SPIN', 'BANK'],
    rewardCredits: 10,
  },
];
