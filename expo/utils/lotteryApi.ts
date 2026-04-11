import { GameType, LiveDraw, LotteryApiRecord } from '@/types/lottery';

const POWERBALL_URL = 'https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date DESC&$limit=25';
const MEGA_MILLIONS_URL = 'https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date DESC&$limit=25';

const ENDPOINTS: Record<GameType, string> = {
  powerball: POWERBALL_URL,
  megamillions: MEGA_MILLIONS_URL,
};

function parseNumberList(value: string | undefined): number[] {
  if (!value) {
    return [];
  }

  return value
    .split(/[\s,]+/)
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((num) => Number.isFinite(num) && num > 0);
}

function normalizeRecord(game: GameType, record: LotteryApiRecord): LiveDraw | null {
  const numbers = parseNumberList(record.winning_numbers);
  if (numbers.length < 6) {
    return null;
  }

  const bonusNumber = numbers[numbers.length - 1] ?? 0;
  const mainNumbers = numbers.slice(0, 5).sort((a, b) => a - b);
  if (mainNumbers.length !== 5 || bonusNumber <= 0) {
    return null;
  }

  return {
    id: `${game}-${record.draw_date}-${record.winning_numbers}`,
    game,
    drawDate: record.draw_date,
    numbers: mainNumbers,
    bonusNumber,
    multiplier: record.multiplier ? Number.parseInt(record.multiplier, 10) : null,
    jackpot: record.jackpot ?? null,
    videoUrl: record.video_url ?? null,
    source: 'live',
  };
}

export async function fetchRecentDraws(game: GameType): Promise<LiveDraw[]> {
  const endpoint = ENDPOINTS[game];
  console.log('[lotteryApi] Fetching recent draws', { game, endpoint });

  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to load ${game} draws right now.`);
  }

  const raw = (await response.json()) as LotteryApiRecord[];
  const draws = raw
    .map((record) => normalizeRecord(game, record))
    .filter((draw): draw is LiveDraw => draw !== null);

  console.log('[lotteryApi] Loaded draws', { game, count: draws.length });
  return draws;
}
