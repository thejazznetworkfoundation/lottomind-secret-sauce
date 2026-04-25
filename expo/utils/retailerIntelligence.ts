import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LotteryStoreData } from '@/mocks/lottery-stores';

const FAVORITES_KEY = 'LOTTO_MIND_RETAILER_FAVORITES_V1';

const SCRATCHER_TITLES = [
  'Gold Rush',
  'Lucky 7s',
  'Diamond Vault',
  'Cash Blast',
  'Emerald Millions',
  'Fast 50s',
  'Bonus Bucks',
  'Ruby Riches',
];

export type RetailerStockConfidence = 'High' | 'Medium' | 'Low';

export type RetailerIntelligence = {
  retailerScore: number;
  topPrizeSellerSignal: boolean;
  scratcherStockConfidence: RetailerStockConfidence;
  scratchersLikelyInStock: string[];
  bestFor: string[];
  routeHint: string;
  note: string;
};

function hashText(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickScratchers(seed: number, count: number): string[] {
  const titles = [...SCRATCHER_TITLES];
  const picks: string[] = [];

  for (let i = 0; i < count && titles.length > 0; i += 1) {
    const index = (seed + i * 7) % titles.length;
    picks.push(titles[index]);
    titles.splice(index, 1);
  }

  return picks;
}

export function getRetailerIntelligence(store: LotteryStoreData): RetailerIntelligence {
  const seed = hashText(`${store.id}-${store.name}-${store.city}-${store.stateCode}`);
  const gameDepth = Math.min(store.games.length, 8) * 4;
  const ratingBoost = Math.round((store.rating - 3.5) * 18);
  const typeBoost =
    store.type === 'grocery' || store.type === 'convenience'
      ? 8
      : store.type === 'gas_station'
        ? 6
        : 3;
  const hoursBoost = store.hours.toLowerCase().includes('24') ? 8 : 0;
  const retailerScore = Math.max(
    40,
    Math.min(96, 48 + gameDepth + ratingBoost + typeBoost + hoursBoost + (seed % 9))
  );
  const scratcherStockConfidence: RetailerStockConfidence =
    retailerScore >= 82 ? 'High' : retailerScore >= 66 ? 'Medium' : 'Low';

  const bestFor = [
    store.games.some((game) => /pick|daily|cash/i.test(game)) ? 'Daily games' : 'Jackpot games',
    store.type === 'gas_station' || store.hours.toLowerCase().includes('24')
      ? 'Quick route stops'
      : 'Planned ticket runs',
    store.rating >= 4.4 ? 'Highly rated counter' : 'Nearby lottery access',
  ];

  return {
    retailerScore,
    topPrizeSellerSignal: retailerScore >= 84,
    scratcherStockConfidence,
    scratchersLikelyInStock: pickScratchers(seed, scratcherStockConfidence === 'High' ? 3 : 2),
    bestFor,
    routeHint: store.hours.toLowerCase().includes('24')
      ? 'Good late route option'
      : 'Check hours before heading out',
    note: 'Retailer signals are estimates from available store data. Confirm tickets, scratcher inventory, and services with the retailer.',
  };
}

export async function getFavoriteRetailerIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch (error) {
    console.log('[RetailerIntelligence] favorite load error', error);
    return [];
  }
}

export async function saveFavoriteRetailerIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(ids)]));
  } catch (error) {
    console.log('[RetailerIntelligence] favorite save error', error);
  }
}

export async function toggleFavoriteRetailer(id: string): Promise<string[]> {
  const current = await getFavoriteRetailerIds();
  const next = current.includes(id)
    ? current.filter((favoriteId) => favoriteId !== id)
    : [id, ...current];

  await saveFavoriteRetailerIds(next);
  return next;
}
