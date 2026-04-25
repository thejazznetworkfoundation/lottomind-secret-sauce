export type DreamVideoStyle =
  | 'Cinematic Noir'
  | 'Surreal Dream'
  | 'Spiritual Vision'
  | 'Horror Dream'
  | 'Futuristic Gold';

export type DreamVideoStatus = 'queued' | 'rendering' | 'completed' | 'failed';

export type ContestEntryStatus = 'submitted' | 'featured' | 'winner';

export type CreatorBadge =
  | 'Dream Director'
  | 'Gold Vision Creator'
  | 'Featured Dream Maker'
  | 'Oracle Spotlight'
  | 'Visionary Rank';

export type ContestRewardPlacement = 1 | 2 | 3 | 'featured';

export interface DreamShot {
  scene: number;
  description: string;
  camera: string;
  motion: string;
  lighting: string;
  duration: number;
}

export interface DreamVideoScript {
  id: string;
  title: string;
  dreamText: string;
  summary: string;
  mood: string;
  symbols: string[];
  characters: string[];
  locations: string[];
  colorPalette: string[];
  visualStyle: DreamVideoStyle;
  shots: DreamShot[];
  voiceover: string;
  musicPrompt: string;
  videoPromptShort: string;
  videoPromptLong: string;
  createdAt: string;
}

export interface GeneratedDreamVideo {
  id: string;
  scriptId: string;
  title: string;
  style: DreamVideoStyle;
  status: DreamVideoStatus;
  progress: number;
  createdAt: string;
  lastUpdatedAt: string;
  shareCaption: string;
  thumbnailPrompt: string;
  providerLabel: string;
  errorMessage?: string;
}

export interface ContestReward {
  placement: ContestRewardPlacement;
  label: string;
  creditsAwarded: number;
  unlockStyles: DreamVideoStyle[];
  badge?: CreatorBadge;
  creatorRankBoost?: number;
  premiumAccessWindow?: string;
  visibilityBoost?: boolean;
}

export interface ContestEntry {
  id: string;
  scriptId: string;
  videoId: string;
  title: string;
  dreamText: string;
  style: DreamVideoStyle;
  votes: number;
  status: ContestEntryStatus;
  createdAt: string;
  placement?: 1 | 2 | 3;
  badge?: CreatorBadge;
  reward?: ContestReward;
  highlight?: string;
}

export interface UserCreditWallet {
  currentCredits: number;
  freeRendersRemaining: number;
  renderCost: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;
}

export interface UnlockInventory {
  unlockedStyles: DreamVideoStyle[];
  premiumAccessWindows: string[];
  creatorBadges: CreatorBadge[];
  creatorRank: number;
}

export interface DreamVideoPersistedState {
  dreamInputDraft: string;
  selectedStyle: DreamVideoStyle;
  scripts: DreamVideoScript[];
  videos: GeneratedDreamVideo[];
  contestEntries: ContestEntry[];
  activeScriptId: string | null;
  winnersFinalized: boolean;
  unlockInventory: UnlockInventory;
  freeRendersRemaining: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;
  lastRewardSummary: string | null;
}

export interface VideoRenderStep {
  delayMs: number;
  status: DreamVideoStatus;
  progress: number;
  message: string;
}

export interface DreamActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
