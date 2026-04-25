export type RecordDrop = {
  title: string;
  format: string;
  detail: string;
  priceCredits: number;
  accent: string;
  tags: string[];
  featured?: boolean;
};

export const RECORD_DROPS: RecordDrop[] = [
  {
    title: 'Vault Run OST',
    format: 'Arcade soundtrack',
    detail: 'A jungle-tech chase score built for arcade sessions, trailers, and live promo loops.',
    priceCredits: 420,
    accent: '#8A7BFF',
    tags: ['Arcade', 'Synth', 'Loop Pack'],
  },
  {
    title: 'Oracle Nights',
    format: 'Featured song',
    detail: 'Late-night LottoMind ambience for dream study, journaling, and quiet number work.',
    priceCredits: 260,
    accent: '#4DD6FF',
    tags: ['Ambient', 'Dreams', 'Focus'],
    featured: true,
  },
  {
    title: 'Lucky Frequency Sessions',
    format: 'Record drop',
    detail: 'Branded audio art for promos, lounges, and stream-ready LottoMind showcase reels.',
    priceCredits: 340,
    accent: '#F9C74F',
    tags: ['Promo', 'Branding', 'Live Mix'],
  },
];

export const FEATURED_RECORD_DROP =
  RECORD_DROPS.find((drop) => drop.featured) ?? RECORD_DROPS[0];
