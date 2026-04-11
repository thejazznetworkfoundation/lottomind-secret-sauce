export interface LevelConfig {
  level: number;
  title: string;
  minXP: number;
  icon: string;
  color: string;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, title: 'Rookie', minXP: 0, icon: '🎲', color: '#A0A0A0' },
  { level: 2, title: 'Strategist', minXP: 100, icon: '🧠', color: '#3498DB' },
  { level: 3, title: 'Pattern Reader', minXP: 300, icon: '🔍', color: '#2ECC71' },
  { level: 4, title: 'AI Insider', minXP: 600, icon: '⚡', color: '#E67E22' },
  { level: 5, title: 'LottoMind Elite', minXP: 1000, icon: '👑', color: '#FFD700' },
  { level: 6, title: 'Grand Master', minXP: 2000, icon: '💎', color: '#9B59B6' },
  { level: 7, title: 'Legendary', minXP: 5000, icon: '🔥', color: '#E74C3C' },
];

export const XP_REWARDS = {
  generate: 10,
  chat: 5,
  share: 25,
  invite: 100,
  dailyOpen: 15,
  dreamInterpret: 20,
  scanTicket: 10,
} as const;

export const REFERRAL_TIERS = [
  { count: 1, reward: '+5 credits', credits: 5 },
  { count: 5, reward: 'PRO for 1 day', credits: 10 },
  { count: 10, reward: 'AI Lucky Boost', credits: 25 },
  { count: 25, reward: 'Premium forever', credits: 100 },
] as const;

export function getLevelForXP(xp: number): LevelConfig {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

export function getNextLevel(xp: number): LevelConfig | null {
  for (const level of LEVELS) {
    if (xp < level.minXP) {
      return level;
    }
  }
  return null;
}

export function getXPProgress(xp: number): number {
  const current = getLevelForXP(xp);
  const next = getNextLevel(xp);
  if (!next) return 1;
  const range = next.minXP - current.minXP;
  const progress = xp - current.minXP;
  return Math.min(1, progress / range);
}
