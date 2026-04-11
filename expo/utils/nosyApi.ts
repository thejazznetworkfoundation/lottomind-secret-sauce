const NOSY_API_BASE = 'https://www.nosyapi.com/apiv2/service/lottery-results';
const API_KEY = process.env.EXPO_PUBLIC_NOSY_API_KEY ?? '';

export interface NosyAdditionalNumber {
  playerPicked: boolean;
  name: string;
  minBall: number;
  maxBall: number;
  allowZero: boolean;
  isString: boolean;
  isMultiplier: boolean;
  allowedValues: number[] | null;
}

export interface NosyBonusNumber {
  name: string;
  abbreviation: string;
  isMultiplier: boolean;
  variant: string | null;
}

export interface NosyPrizeMultiplier {
  name: string;
  abbreviation: string;
  isMultiplier: boolean;
  variant: string | null;
}

export interface NosyStateInfo {
  state: string;
  stateCode: string;
  slug: string;
  taxRate: string;
  minimumLegalAge: number;
}

export interface NosyDrawDays {
  Sunday: boolean;
  Monday: boolean;
  Tuesday: boolean;
  Wednesday: boolean;
  Thursday: boolean;
  Friday: boolean;
  Saturday: boolean;
}

export interface NosyGame {
  id: number;
  gameName: string;
  logo: string;
  drawTimezone: string;
  drawTime: string;
  stopSaleTime: string;
  claimDeadline: number;
  allowZero: boolean;
  minBall: number;
  maxBall: number;
  drawnNumbers: number;
  selectableBalls: number;
  minimumSelectableBalls: number;
  uniqueMainNumbers: number;
  uniqueExtraNumbers: number | null;
  allowDuplicates: boolean;
  additionalNumbers: NosyAdditionalNumber[];
  bonusNumbers: NosyBonusNumber[];
  prizeMultipliers: NosyPrizeMultiplier[];
  mainDrawName: string | null;
  state: NosyStateInfo;
  statesWithMultiDraws: string[] | null;
  drawDays: NosyDrawDays;
}

export interface NosyGameListResponse {
  status: string;
  message: string;
  systemTime: number;
  endpoint: string;
  rowCount: number;
  creditUsed: number;
  data: NosyGame[];
}

export async function fetchStateGameList(stateCode: string): Promise<NosyGame[]> {
  if (!API_KEY) {
    console.log('[nosyApi] No API key configured, returning empty game list');
    return [];
  }

  const url = `${NOSY_API_BASE}/states/game-list?state=${stateCode}&apiKey=${API_KEY}`;
  console.log('[nosyApi] Fetching game list for state:', stateCode);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      console.log('[nosyApi] HTTP error:', response.status, response.statusText);
      return [];
    }

    const json = (await response.json()) as NosyGameListResponse;

    if (json.status !== 'success' || !Array.isArray(json.data)) {
      console.log('[nosyApi] Non-success response:', json.message);
      return [];
    }

    console.log('[nosyApi] Loaded', json.data.length, 'games for', stateCode);
    return json.data;
  } catch (error) {
    console.log('[nosyApi] Fetch error:', error);
    return [];
  }
}

export function getDrawDaysLabel(drawDays: NosyDrawDays): string {
  const days: string[] = [];
  if (drawDays.Sunday) days.push('Sun');
  if (drawDays.Monday) days.push('Mon');
  if (drawDays.Tuesday) days.push('Tue');
  if (drawDays.Wednesday) days.push('Wed');
  if (drawDays.Thursday) days.push('Thu');
  if (drawDays.Friday) days.push('Fri');
  if (drawDays.Saturday) days.push('Sat');

  if (days.length === 7) return 'Daily';
  if (days.length === 0) return 'N/A';
  return days.join(', ');
}

export function getGameTypeColor(game: NosyGame): string {
  const name = game.gameName.toLowerCase();
  if (name.includes('powerball')) return '#E74C3C';
  if (name.includes('mega millions')) return '#3498DB';
  if (name.includes('pick 3') || name.includes('pick3')) return '#9B59B6';
  if (name.includes('pick 4') || name.includes('pick4')) return '#16A085';
  if (name.includes('cash')) return '#2ECC71';
  if (name.includes('lucky')) return '#27AE60';
  if (name.includes('lotto')) return '#F5A623';
  return '#D4AF37';
}

export interface NosyGameDrawResult {
  gameId: number;
  gameName: string;
  numbers: number[];
  bonusNumbers: number[];
  multiplier: number | null;
  drawDate: string;
  drawTime: string;
  source: 'live' | 'simulated';
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getLastDrawDate(drawDays: NosyDrawDays): string {
  const dayNames: (keyof NosyDrawDays)[] = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  ];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() - i);
    const dayName = dayNames[candidate.getDay()];
    if (drawDays[dayName]) {
      return candidate.toISOString().split('T')[0];
    }
  }
  const d = new Date(now);
  d.setDate(now.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function generateNumbersForGame(game: NosyGame, seed: number): { main: number[]; bonus: number[] } {
  const rng = seededRandom(seed);
  const main: number[] = [];
  const min = game.allowZero ? 0 : (game.minBall || 1);
  const max = game.maxBall;
  const count = game.drawnNumbers;

  if (game.allowDuplicates) {
    for (let i = 0; i < count; i++) {
      main.push(Math.floor(rng() * (max - min + 1)) + min);
    }
  } else {
    const pool: number[] = [];
    for (let n = min; n <= max; n++) pool.push(n);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      main.push(pool[i]);
    }
    main.sort((a, b) => a - b);
  }

  const bonus: number[] = [];
  for (const an of game.additionalNumbers) {
    if (!an.playerPicked) continue;
    const bMin = an.allowZero ? 0 : (an.minBall || 1);
    const bMax = an.maxBall;
    bonus.push(Math.floor(rng() * (bMax - bMin + 1)) + bMin);
  }

  return { main, bonus };
}

export function buildGameDrawResults(games: NosyGame[], liveDraws?: { game: string; numbers: number[]; bonusNumber: number; drawDate: string }[]): NosyGameDrawResult[] {
  const results: NosyGameDrawResult[] = [];
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  for (const game of games) {
    const isPowerball = game.gameName.toLowerCase().includes('powerball');
    const isMega = game.gameName.toLowerCase().includes('mega millions');

    if ((isPowerball || isMega) && liveDraws && liveDraws.length > 0) {
      const gameKey = isPowerball ? 'powerball' : 'megamillions';
      const liveDraw = liveDraws.find(d => d.game === gameKey);
      if (liveDraw) {
        results.push({
          gameId: game.id,
          gameName: game.gameName,
          numbers: liveDraw.numbers,
          bonusNumbers: [liveDraw.bonusNumber],
          multiplier: null,
          drawDate: liveDraw.drawDate,
          drawTime: game.drawTime,
          source: 'live',
        });
        continue;
      }
    }

    const seed = dateSeed * 31 + game.id * 17;
    const { main, bonus } = generateNumbersForGame(game, seed);
    const drawDate = getLastDrawDate(game.drawDays);

    let multiplier: number | null = null;
    for (const an of game.additionalNumbers) {
      if (an.isMultiplier && an.allowedValues && an.allowedValues.length > 0) {
        const rng = seededRandom(seed + 999);
        multiplier = an.allowedValues[Math.floor(rng() * an.allowedValues.length)];
        break;
      }
    }

    results.push({
      gameId: game.id,
      gameName: game.gameName,
      numbers: main,
      bonusNumbers: bonus,
      multiplier,
      drawDate,
      drawTime: game.drawTime,
      source: 'simulated',
    });
  }

  console.log('[nosyApi] Built draw results for', results.length, 'games');
  return results;
}
