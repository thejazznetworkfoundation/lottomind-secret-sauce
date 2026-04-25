export type NewsRadarAlertType = 'rule-change' | 'jackpot' | 'unclaimed' | 'drawing-delay' | 'system';

export type NewsRadarAlert = {
  id: string;
  type: NewsRadarAlertType;
  title: string;
  detail: string;
  appliesTo: string[];
  severity: 'info' | 'watch' | 'urgent';
  createdAt: string;
};

const STATIC_ALERTS: NewsRadarAlert[] = [
  {
    id: 'mega-matrix-2025',
    type: 'rule-change',
    title: 'Mega Millions matrix-aware stats enabled',
    detail: 'Mega Millions changed its matrix on April 8, 2025. LottoMind separates current-era stats from older draws.',
    appliesTo: ['megamillions', 'heatmap', 'intelligence'],
    severity: 'watch',
    createdAt: '2025-04-08T12:00:00.000Z',
  },
  {
    id: 'jackpot-reality',
    type: 'jackpot',
    title: 'Jackpot Reality reminder',
    detail: 'Headline jackpots are not take-home payouts. Review cash, annuity, federal tax, and state tax before planning.',
    appliesTo: ['powerball', 'megamillions', 'jackpot'],
    severity: 'info',
    createdAt: '2026-04-21T12:00:00.000Z',
  },
  {
    id: 'saved-games-alerts',
    type: 'system',
    title: 'Saved game alerts ready',
    detail: 'LottoMind can surface rule changes, delays, and jackpot movement for your saved games when live alert feeds are connected.',
    appliesTo: ['all'],
    severity: 'info',
    createdAt: '2026-04-21T12:00:00.000Z',
  },
];

export function getNewsRadarAlerts(scope: string = 'all'): NewsRadarAlert[] {
  return STATIC_ALERTS.filter((alert) => alert.appliesTo.includes('all') || alert.appliesTo.includes(scope));
}
