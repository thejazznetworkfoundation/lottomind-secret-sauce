import AsyncStorage from '@react-native-async-storage/async-storage';

export const PSYCHIC_FULL_UNLOCK_KEY = 'lottomind.psychic.fullUnlockExpiresAt';
export const PSYCHIC_FULL_UNLOCK_COST = 100;
export const PSYCHIC_FULL_UNLOCK_DURATION_MS = 24 * 60 * 60 * 1000;

export async function getPsychicFullUnlockExpiresAt(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(PSYCHIC_FULL_UNLOCK_KEY);
    return raw ? Number(raw) || null : null;
  } catch (error) {
    console.log('[PsychicUnlocks] load failed', error);
    return null;
  }
}

export function isPsychicFullUnlockActive(expiresAt: number | null): boolean {
  return Boolean(expiresAt && expiresAt > Date.now());
}

export async function savePsychicFullUnlock(): Promise<number> {
  const expiresAt = Date.now() + PSYCHIC_FULL_UNLOCK_DURATION_MS;
  await AsyncStorage.setItem(PSYCHIC_FULL_UNLOCK_KEY, String(expiresAt));
  return expiresAt;
}
