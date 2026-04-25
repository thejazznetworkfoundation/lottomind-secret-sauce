import AsyncStorage from '@react-native-async-storage/async-storage';

const FALLBACK_CREDITS_KEY = 'lottomind.fallbackCredits';
const UNLOCK_PREFIX = 'lottomind.unlock.';

async function getFallbackCredits() {
  const raw = await AsyncStorage.getItem(FALLBACK_CREDITS_KEY);
  return raw ? Number(raw) || 0 : 0;
}

async function setFallbackCredits(amount: number) {
  await AsyncStorage.setItem(FALLBACK_CREDITS_KEY, String(Math.max(0, amount)));
}

export async function canUseFeature(featureKey: string): Promise<boolean> {
  return hasActiveUnlock(featureKey);
}

export async function chargeCredits(amount: number, reason: string): Promise<boolean> {
  try {
    const current = await getFallbackCredits();
    if (current < amount) return false;
    await setFallbackCredits(current - amount);
    console.log(`[CreditGuards] Charged ${amount} credits for ${reason}`);
    return true;
  } catch (error) {
    console.log('[CreditGuards] charge failed', error);
    return false;
  }
}

export async function hasActiveUnlock(featureKey: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(`${UNLOCK_PREFIX}${featureKey}`);
    if (!raw) return false;
    return Number(raw) > Date.now();
  } catch (error) {
    console.log('[CreditGuards] unlock check failed', error);
    return false;
  }
}

export async function unlockFeatureFor24Hours(featureKey: string, cost: number): Promise<boolean> {
  const charged = await chargeCredits(cost, `${featureKey} 24-hour unlock`);
  if (!charged) return false;

  try {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await AsyncStorage.setItem(`${UNLOCK_PREFIX}${featureKey}`, String(expiresAt));
    return true;
  } catch (error) {
    console.log('[CreditGuards] unlock failed', error);
    return false;
  }
}
