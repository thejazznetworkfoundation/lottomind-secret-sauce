export type FeatureFlags = {
  aiPsychicEngine: boolean;
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  aiPsychicEngine: true,
};

export const FEATURE_FLAG_KEYS = {
  aiPsychicEngine: 'feature_aiPsychicEngine',
} as const;

export const LEGACY_FEATURE_FLAG_KEYS = {
  aiPsychicEngine: 'lottomind.feature.aiPsychicEngine',
} as const;
