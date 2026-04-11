import { Platform } from 'react-native';
import { GameType, LiveDraw } from '@/types/lottery';

export interface JackpotInfo {
  game: GameType;
  gameName: string;
  currentJackpot: string;
  cashValue: string | null;
  nextDrawDate: string;
  lastUpdated: string;
  isHuge: boolean;
}

export interface LiveJackpotData {
  powerball: { jackpot: number; cashValue: number; nextDraw: string } | null;
  megamillions: { jackpot: number; cashValue: number; nextDraw: string } | null;
}

const JACKPOT_THRESHOLDS: Record<GameType, number> = {
  powerball: 300_000_000,
  megamillions: 300_000_000,
};

const LOTTERY_USA_URLS: Record<GameType, string> = {
  powerball: 'https://www.lotteryusa.com/powerball/',
  megamillions: 'https://www.lotteryusa.com/mega-millions/',
};

function parseJackpotAmount(raw: string | null): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  if (raw.toLowerCase().includes('billion')) {
    return Math.round(num * 1_000_000_000);
  }
  if (raw.toLowerCase().includes('million')) {
    return Math.round(num * 1_000_000);
  }
  return isNaN(num) ? 0 : num;
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(0)}M`;
  }
  return `${amount.toLocaleString()}`;
}

async function scrapeJackpotFromPage(game: GameType): Promise<{ jackpot: number; cashValue: number } | null> {
  try {
    const url = LOTTERY_USA_URLS[game];
    console.log(`[jackpotApi] Fetching jackpot from ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      console.log(`[jackpotApi] Failed to fetch ${game} page: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const moneyMatches = html.match(/\$[0-9,.]+\s*(Million|Billion)/gi) ?? [];
    console.log(`[jackpotApi] Found money matches for ${game}:`, moneyMatches.slice(0, 5));

    if (moneyMatches.length === 0) return null;

    const jackpotRaw = moneyMatches[0];
    const jackpot = parseJackpotAmount(jackpotRaw);

    let cashValue = 0;
    if (moneyMatches.length > 1) {
      cashValue = parseJackpotAmount(moneyMatches[1]);
    }
    if (cashValue === 0 && jackpot > 0) {
      cashValue = Math.round(jackpot * 0.48);
    }

    console.log(`[jackpotApi] Parsed ${game} jackpot: ${jackpot}, cash: ${cashValue}`);
    return { jackpot, cashValue };
  } catch (error) {
    console.log(`[jackpotApi] Error scraping ${game} jackpot:`, error);
    return null;
  }
}

export async function fetchLiveJackpots(): Promise<LiveJackpotData> {
  console.log('[jackpotApi] Fetching live jackpot data...');
  const [pb, mm] = await Promise.all([
    scrapeJackpotFromPage('powerball'),
    scrapeJackpotFromPage('megamillions'),
  ]);

  const result: LiveJackpotData = {
    powerball: pb ? { jackpot: pb.jackpot, cashValue: pb.cashValue, nextDraw: '' } : null,
    megamillions: mm ? { jackpot: mm.jackpot, cashValue: mm.cashValue, nextDraw: '' } : null,
  };

  console.log('[jackpotApi] Live jackpot result:', JSON.stringify(result));
  return result;
}

export function buildJackpotInfo(
  game: GameType,
  draws: LiveDraw[],
  liveJackpot?: { jackpot: number; cashValue: number; nextDraw: string } | null,
): JackpotInfo | null {
  const latest = draws[0];
  if (!latest) return null;

  const threshold = JACKPOT_THRESHOLDS[game];
  const drawDate = new Date(latest.drawDate);
  const nextDraw = new Date(drawDate);
  nextDraw.setDate(nextDraw.getDate() + (game === 'powerball' ? 3 : 4));

  let jackpotDisplay: string;
  let cashValueDisplay: string | null = null;
  let amount = 0;

  if (liveJackpot && liveJackpot.jackpot > 0) {
    amount = liveJackpot.jackpot;
    jackpotDisplay = formatCurrency(amount);
    cashValueDisplay = liveJackpot.cashValue > 0
      ? formatCurrency(liveJackpot.cashValue)
      : formatCurrency(Math.round(amount * 0.48));
  } else {
    const rawJackpot = latest.jackpot;
    amount = parseJackpotAmount(rawJackpot);
    jackpotDisplay = amount > 0 ? formatCurrency(amount) : (rawJackpot ?? 'Updating...');
    cashValueDisplay = amount > 0 ? formatCurrency(Math.round(amount * 0.48)) : null;
  }

  return {
    game,
    gameName: game === 'powerball' ? 'Powerball' : 'Mega Millions',
    currentJackpot: jackpotDisplay,
    cashValue: cashValueDisplay,
    nextDrawDate: nextDraw.toISOString().split('T')[0],
    lastUpdated: new Date().toISOString(),
    isHuge: amount >= threshold,
  };
}

export function shouldNotifyJackpot(info: JackpotInfo): boolean {
  return info.isHuge;
}

export function getJackpotAlertMessage(info: JackpotInfo): string {
  if (info.isHuge) {
    return `${info.gameName} jackpot is at ${info.currentJackpot}! Next draw: ${info.nextDrawDate}`;
  }
  return `${info.gameName}: ${info.currentJackpot}`;
}
