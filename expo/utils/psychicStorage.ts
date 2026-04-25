import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PsychicReadingResult } from '@/utils/psychicEngine';

const HISTORY_KEY = 'lottomind.psychic.history';
const USAGE_PREFIX = 'lottomind.psychic.usage.';

export type SavedPsychicReading = {
  id: string;
  createdAt: string;
  userPrompt: string;
  reading: PsychicReadingResult;
  suggestedNumbers: number[];
  pick3: string;
  pick4: string;
  energyScore: number;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function savePsychicReading(reading: SavedPsychicReading): Promise<void> {
  try {
    const current = await getPsychicReadings();
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([reading, ...current].slice(0, 50)));
  } catch (error) {
    console.log('[PsychicStorage] save failed', error);
  }
}

export async function getPsychicReadings(): Promise<SavedPsychicReading[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<SavedPsychicReading>>;
    return parsed
      .filter((item) => item.id && item.createdAt && item.userPrompt && item.reading)
      .map((item) => ({
        id: item.id as string,
        createdAt: item.createdAt as string,
        userPrompt: item.userPrompt as string,
        reading: item.reading as PsychicReadingResult,
        suggestedNumbers: item.suggestedNumbers ?? item.reading?.suggestedNumbers ?? [],
        pick3: item.pick3 ?? item.reading?.pick3 ?? '---',
        pick4: item.pick4 ?? item.reading?.pick4 ?? '----',
        energyScore: item.energyScore ?? item.reading?.energyScore ?? 0,
      }));
  } catch (error) {
    console.log('[PsychicStorage] load failed', error);
    return [];
  }
}

export async function clearPsychicReadings(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.log('[PsychicStorage] clear failed', error);
  }
}

export async function getTodayPsychicUsage(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(`${USAGE_PREFIX}${todayKey()}`);
    return raw ? Number(raw) || 0 : 0;
  } catch (error) {
    console.log('[PsychicStorage] usage load failed', error);
    return 0;
  }
}

export async function incrementTodayPsychicUsage(): Promise<number> {
  const next = (await getTodayPsychicUsage()) + 1;
  try {
    await AsyncStorage.setItem(`${USAGE_PREFIX}${todayKey()}`, String(next));
  } catch (error) {
    console.log('[PsychicStorage] usage save failed', error);
  }
  return next;
}
