export const lottoDisclaimer =
  'For entertainment only. Lottery outcomes are random. No reading, prediction, or number suggestion can guarantee a win.';

export const luckyNumbers = [7, 18, 27, 34, 42, 11];

export const games = [
  { title: 'Powerball', subtitle: 'Next draw in 08:24:16', icon: 'PB', route: '/live-results' },
  { title: 'Mega Millions', subtitle: 'Next draw in 1 day', icon: 'MM', route: '/live-results' },
  { title: 'Pick 3', subtitle: 'Daily 3 numbers', icon: 'P3', route: '/daily-tools' },
  { title: 'Pick 4', subtitle: 'Daily 4 numbers', icon: 'P4', route: '/daily-tools' },
  { title: 'Daily 3', subtitle: 'Midday and evening', icon: 'D3', route: '/daily-tools' },
  { title: 'Daily 4', subtitle: 'Midday and evening', icon: 'D4', route: '/daily-tools' },
  { title: 'Fantasy 5', subtitle: 'Play for fun', icon: 'F5', route: '/number-generator' },
];

export const drawHistory = [
  { date: 'May 22, 2025', numbers: [12, 17, 23, 44, 61], special: 15, multiplier: '2X' },
  { date: 'May 19, 2025', numbers: [8, 17, 27, 34, 52], special: 10, multiplier: '2X' },
  { date: 'May 15, 2025', numbers: [3, 24, 33, 40, 58], special: 7, multiplier: '3X' },
];

export const generatedSets = [
  { label: 'Balanced', numbers: [7, 18, 27, 34, 42], special: 11 },
  { label: 'Hot & Cold', numbers: [9, 16, 28, 37, 45], special: 12 },
  { label: 'Avoid Repeats', numbers: [11, 19, 26, 33, 47], special: 8 },
];

export const heatmapNumbers = Array.from({ length: 39 }, (_, index) => ({
  value: index + 1,
  heat: ((index * 7) % 10) / 10,
}));

export const dailyTools = [
  'Straight / Box Converter',
  'Sum Analyzer',
  'Pair Finder',
  'Mirror Numbers',
  'Trend Analyzer',
];

export const intelligenceCards = [
  { title: 'Most Frequent', numbers: [7, 18, 23, 34, 42] },
  { title: 'Least Frequent', numbers: [2, 8, 16, 24, 67] },
  { title: 'Overdue Numbers', numbers: [5, 13, 19, 26, 66] },
  { title: 'Repeat Numbers', numbers: [11, 22, 33] },
];

export const walletCards = [
  { title: 'Dream Numbers', subtitle: 'Saved from Dream Oracle', numbers: [9, 14, 23, 31, 45], special: 9 },
  { title: 'Psychic Picks', subtitle: 'Symbolic reading set', numbers: [11, 19, 26, 33, 47], special: 8, psychic: true },
  { title: 'Hot Picks', subtitle: 'Heatmap strategy', numbers: [7, 18, 27, 34, 42], special: 11 },
  { title: 'Custom Set', subtitle: 'Manual saved set', numbers: [3, 12, 30, 40, 60], special: 6 },
];

export const leaderboard = [
  { rank: 1, name: 'DreamMaster', points: 2450 },
  { rank: 2, name: 'LuckyStar', points: 1890 },
  { rank: 3, name: 'MindPlayer', points: 1650 },
  { rank: 4, name: 'LottoKing', points: 1320 },
];

export const transactions = [
  { title: 'Daily Login Bonus', amount: '+50' },
  { title: 'Dream Oracle Reading', amount: '-25' },
  { title: 'Contest Entry', amount: '-10' },
  { title: 'Referral Bonus', amount: '+100' },
];

export const achievements = [
  { title: 'Dream Explorer', subtitle: 'Unlocks Dream Oracle', progress: '10/10' },
  { title: 'Psychic Seeker', subtitle: 'Unlocks 25 readings', progress: '19/25', psychic: true },
  { title: 'Hot Streak', subtitle: 'Get 5 correct predictions', progress: '3/5' },
  { title: 'Contest Master', subtitle: 'Win 3 contests', progress: '2/3' },
];

export const notifications = [
  { type: 'Results', title: 'Powerball Results', time: '1m ago' },
  { type: 'Fortune', title: 'Daily Fortune Ready', time: '1h ago', psychic: true },
  { type: 'Contest', title: 'Contest Update', time: '3h ago' },
  { type: 'System', title: 'Credit Bonus', time: '1d ago' },
];

export const historyItems = [
  { type: 'Readings', title: 'Dream Reading', detail: 'May 23, 2026' },
  { type: 'Readings', title: 'Psychic Reading', detail: 'May 24, 2026', psychic: true },
  { type: 'Numbers', title: 'Generator', detail: 'May 24, 2026' },
  { type: 'Tickets', title: 'Generated Numbers', detail: 'May 24, 2026' },
];

export const communityPosts = [
  { name: 'DreamMaster', body: 'Just had an amazing dream reading.', time: '2m ago' },
  { name: 'LuckyPlayer', body: 'These numbers hit 3 times!', time: '15m ago' },
  { name: 'MindGuru', body: 'Focus on your energy.', time: '1h ago' },
  { name: 'Credit Bonus', body: 'You received 50 credits.', time: '1d ago' },
];
