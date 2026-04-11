const STATES = ['Texas', 'New York', 'California', 'Michigan', 'Florida', 'Illinois', 'Georgia', 'Pennsylvania', 'Ohio', 'New Jersey'];
const GAMES = ['Powerball', 'Mega Millions', 'Pick 3', 'Pick 4', 'Cash 5'];
const MATCH_TYPES = ['matched 3 numbers', 'matched 4 numbers', 'hit Pick 3', 'hit Daily 4', 'matched 5 numbers', 'hit Cash 5'];
const TIME_AGO = ['2m ago', '5m ago', '12m ago', '18m ago', '25m ago', '34m ago', '41m ago', '1h ago', '2h ago'];

export interface WinFeedItem {
  id: string;
  state: string;
  game: string;
  matchType: string;
  timeAgo: string;
}

export function generateWinFeedItems(count: number): WinFeedItem[] {
  const items: WinFeedItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: `win-${Date.now()}-${i}`,
      state: STATES[Math.floor(Math.random() * STATES.length)],
      game: GAMES[Math.floor(Math.random() * GAMES.length)],
      matchType: MATCH_TYPES[Math.floor(Math.random() * MATCH_TYPES.length)],
      timeAgo: TIME_AGO[Math.min(i, TIME_AGO.length - 1)],
    });
  }
  return items;
}
