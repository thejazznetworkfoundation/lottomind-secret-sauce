export type PlanId = 'free' | 'premium' | 'pro' | 'vip';
export type BillingCycle = 'monthly' | 'yearly';

export type FeatureId =
  | 'quick_generator'
  | 'smart_generator'
  | 'dream_to_number'
  | 'ticket_scanner'
  | 'historical_explorer'
  | 'daily34_tools'
  | 'state_intelligence'
  | 'scratcher_tracker'
  | 'saved_numbers_wallet'
  | 'secret_sauce_lab';

export type FeatureCategory = 'generator' | 'scanner' | 'trends' | 'wallet' | 'ai';

export interface FeatureDefinition {
  id: FeatureId;
  name: string;
  description: string;
  creditCost: number;
  requiredPlan: PlanId | null;
  unlockPrice: number | null;
  category: FeatureCategory;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyCredits: number;
  adsEnabled: boolean;
  tagline: string;
}

export interface CreditPack {
  id: string;
  name: string;
  price: number;
  credits: number;
}

export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  premium: 1,
  pro: 2,
  vip: 3,
};

export const PLANS: PlanDefinition[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyCredits: 25,
    adsEnabled: true,
    tagline: 'Great for trying LottoMind',
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 9.99,
    yearlyPrice: 79.99,
    monthlyCredits: 500,
    adsEnabled: false,
    tagline: 'Best for regular players',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 19.99,
    yearlyPrice: 149.99,
    monthlyCredits: 1500,
    adsEnabled: false,
    tagline: 'Best for power users',
  },
  {
    id: 'vip',
    name: 'VIP',
    monthlyPrice: 39.99,
    yearlyPrice: 299.99,
    monthlyCredits: 4000,
    adsEnabled: false,
    tagline: 'Maximum access and highest limits',
  },
];

export const FEATURE_CATALOG: FeatureDefinition[] = [
  {
    id: 'quick_generator',
    name: 'Quick Pick Generator',
    description: 'Fast entertainment-based number generation.',
    creditCost: 1,
    requiredPlan: null,
    unlockPrice: null,
    category: 'generator',
  },
  {
    id: 'smart_generator',
    name: 'Smart Generator',
    description: 'Filtered number generation with deeper controls.',
    creditCost: 2,
    requiredPlan: 'premium',
    unlockPrice: 4.99,
    category: 'generator',
  },
  {
    id: 'dream_to_number',
    name: 'Dream to Number',
    description: 'Map dream themes to numbers for entertainment.',
    creditCost: 2,
    requiredPlan: null,
    unlockPrice: null,
    category: 'ai',
  },
  {
    id: 'ticket_scanner',
    name: 'Ticket Scanner',
    description: 'Scan and analyze ticket info.',
    creditCost: 4,
    requiredPlan: null,
    unlockPrice: null,
    category: 'scanner',
  },
  {
    id: 'historical_explorer',
    name: 'Historical Explorer',
    description: 'Browse historical trends and past draw views.',
    creditCost: 5,
    requiredPlan: 'premium',
    unlockPrice: 6.99,
    category: 'trends',
  },
  {
    id: 'daily34_tools',
    name: 'Daily 3 / Daily 4 Power Tools',
    description: 'Pairs, triples, splits, mirrors, and repeats.',
    creditCost: 4,
    requiredPlan: 'pro',
    unlockPrice: 7.99,
    category: 'trends',
  },
  {
    id: 'state_intelligence',
    name: 'State Intelligence',
    description: 'Deeper state-based trend views and reports.',
    creditCost: 6,
    requiredPlan: 'premium',
    unlockPrice: 12.99,
    category: 'trends',
  },
  {
    id: 'scratcher_tracker',
    name: 'Scratcher Tracker',
    description: 'Track scratcher wins, losses, and ROI.',
    creditCost: 5,
    requiredPlan: 'pro',
    unlockPrice: 8.99,
    category: 'trends',
  },
  {
    id: 'saved_numbers_wallet',
    name: 'Saved Numbers Wallet',
    description: 'Save, label, and reuse favorite number sets.',
    creditCost: 1,
    requiredPlan: 'premium',
    unlockPrice: 5.99,
    category: 'wallet',
  },
  {
    id: 'secret_sauce_lab',
    name: 'Secret Sauce Lab',
    description: 'Advanced premium analysis tools.',
    creditCost: 8,
    requiredPlan: 'pro',
    unlockPrice: 14.99,
    category: 'ai',
  },
];

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'credits_100', name: '100 Credits', price: 4.99, credits: 100 },
  { id: 'credits_250', name: '250 Credits', price: 9.99, credits: 250 },
  { id: 'credits_600', name: '600 Credits', price: 19.99, credits: 600 },
  { id: 'credits_2000', name: '2000 Credits', price: 49.99, credits: 2000 },
];

export function getPlanById(planId: PlanId): PlanDefinition | undefined {
  return PLANS.find((p) => p.id === planId);
}

export function getFeatureById(featureId: FeatureId): FeatureDefinition | undefined {
  return FEATURE_CATALOG.find((f) => f.id === featureId);
}
