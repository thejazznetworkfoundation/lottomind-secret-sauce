export interface StateConfig {
  code: string;
  name: string;
  games: string[];
  timezone: string;
  lotteryUrl: string;
}

export const NATIONWIDE_STATES: Record<string, StateConfig> = {
  TX: {
    code: 'TX',
    name: 'Texas',
    games: ['powerball', 'megamillions', 'lottoTexas', 'pick3', 'daily4', 'cashFive', 'texasTwoStep'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://www.texaslottery.com',
  },
  CA: {
    code: 'CA',
    name: 'California',
    games: ['powerball', 'megamillions', 'superLottoPlus', 'fantasy5', 'daily3', 'daily4'],
    timezone: 'America/Los_Angeles',
    lotteryUrl: 'https://www.calottery.com',
  },
  NY: {
    code: 'NY',
    name: 'New York',
    games: ['powerball', 'megamillions', 'lotto', 'pick3', 'pick4', 'cash4Life'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://nylottery.ny.gov',
  },
  MI: {
    code: 'MI',
    name: 'Michigan',
    games: ['powerball', 'megamillions', 'lotto47', 'daily3', 'daily4', 'fantasy5', 'keno', 'luckyForLife'],
    timezone: 'America/Detroit',
    lotteryUrl: 'https://www.michiganlottery.com',
  },
  FL: {
    code: 'FL',
    name: 'Florida',
    games: ['powerball', 'megamillions', 'floridaLotto', 'pick3', 'pick4', 'cash4Life', 'fantasy5'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.flalottery.com',
  },
  IL: {
    code: 'IL',
    name: 'Illinois',
    games: ['powerball', 'megamillions', 'lotto', 'pick3', 'pick4', 'luckyDayLotto'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://www.illinoislottery.com',
  },
  GA: {
    code: 'GA',
    name: 'Georgia',
    games: ['powerball', 'megamillions', 'cash3', 'cash4', 'fantasy5', 'georgiaLottery'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.galottery.com',
  },
  PA: {
    code: 'PA',
    name: 'Pennsylvania',
    games: ['powerball', 'megamillions', 'cash5', 'pick2', 'pick3', 'pick4', 'match6'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.palottery.state.pa.us',
  },
  OH: {
    code: 'OH',
    name: 'Ohio',
    games: ['powerball', 'megamillions', 'classicLotto', 'pick3', 'pick4', 'rollingCash5'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.ohiolottery.com',
  },
  NJ: {
    code: 'NJ',
    name: 'New Jersey',
    games: ['powerball', 'megamillions', 'pick3', 'pick4', 'cash4Life', 'jerseyCash5'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.njlottery.com',
  },
  NC: {
    code: 'NC',
    name: 'North Carolina',
    games: ['powerball', 'megamillions', 'cash5', 'pick3', 'pick4', 'luckyForLife'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.nclottery.com',
  },
  VA: {
    code: 'VA',
    name: 'Virginia',
    games: ['powerball', 'megamillions', 'cash5', 'pick3', 'pick4', 'cash4Life'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.valottery.com',
  },
  MA: {
    code: 'MA',
    name: 'Massachusetts',
    games: ['powerball', 'megamillions', 'massCash', 'numbersGame', 'megabucks'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.masslottery.com',
  },
  IN: {
    code: 'IN',
    name: 'Indiana',
    games: ['powerball', 'megamillions', 'hoosierLotto', 'daily3', 'daily4', 'cash5'],
    timezone: 'America/Indiana/Indianapolis',
    lotteryUrl: 'https://www.hoosierlottery.com',
  },
  TN: {
    code: 'TN',
    name: 'Tennessee',
    games: ['powerball', 'megamillions', 'cash3', 'cash4', 'tennesseeCash', 'lottoAmerica'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://www.tnlottery.com',
  },
  MO: {
    code: 'MO',
    name: 'Missouri',
    games: ['powerball', 'megamillions', 'showMeCash', 'pick3', 'pick4', 'lotto'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://www.molottery.com',
  },
  WA: {
    code: 'WA',
    name: 'Washington',
    games: ['powerball', 'megamillions', 'lotto', 'hit5', 'match4', 'pick3'],
    timezone: 'America/Los_Angeles',
    lotteryUrl: 'https://www.walottery.com',
  },
  CO: {
    code: 'CO',
    name: 'Colorado',
    games: ['powerball', 'megamillions', 'coloradoLottoPlus', 'pick3', 'cash5', 'luckyForLife'],
    timezone: 'America/Denver',
    lotteryUrl: 'https://www.coloradolottery.com',
  },
  AZ: {
    code: 'AZ',
    name: 'Arizona',
    games: ['powerball', 'megamillions', 'thePick', 'pick3', 'fantasy5', 'tripleTwist'],
    timezone: 'America/Phoenix',
    lotteryUrl: 'https://www.arizonalottery.com',
  },
  MN: {
    code: 'MN',
    name: 'Minnesota',
    games: ['powerball', 'megamillions', 'gopher5', 'northstarCash', 'daily3'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://www.mnlottery.com',
  },
  WI: {
    code: 'WI',
    name: 'Wisconsin',
    games: ['powerball', 'megamillions', 'superCash', 'badger5', 'pick3', 'pick4'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://www.wilottery.com',
  },
  LA: {
    code: 'LA',
    name: 'Louisiana',
    games: ['powerball', 'megamillions', 'lotto', 'pick3', 'pick4', 'easy5'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://www.louisianalottery.com',
  },
  MD: {
    code: 'MD',
    name: 'Maryland',
    games: ['powerball', 'megamillions', 'multiMatch', 'pick3', 'pick4', 'bonusMatch5'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.mdlottery.com',
  },
  KY: {
    code: 'KY',
    name: 'Kentucky',
    games: ['powerball', 'megamillions', 'cashBall', 'pick3', 'pick4', 'fiveCardCash'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.kylottery.com',
  },
  SC: {
    code: 'SC',
    name: 'South Carolina',
    games: ['powerball', 'megamillions', 'pick3', 'pick4', 'palmettoCash5'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.sceducationlottery.com',
  },
  OR: {
    code: 'OR',
    name: 'Oregon',
    games: ['powerball', 'megamillions', 'oregonMegabucks', 'pick4', 'winForLife'],
    timezone: 'America/Los_Angeles',
    lotteryUrl: 'https://www.oregonlottery.org',
  },
  CT: {
    code: 'CT',
    name: 'Connecticut',
    games: ['powerball', 'megamillions', 'ctLotto', 'play3', 'play4', 'cash5', 'luckyForLife'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.ctlottery.org',
  },
  OK: {
    code: 'OK',
    name: 'Oklahoma',
    games: ['powerball', 'megamillions', 'cash5', 'pick3', 'luckyForLife'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://www.lottery.ok.gov',
  },
  IA: {
    code: 'IA',
    name: 'Iowa',
    games: ['powerball', 'megamillions', 'lottoAmerica', 'pick3', 'pick4', 'luckyForLife'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://www.ialottery.com',
  },
  KS: {
    code: 'KS',
    name: 'Kansas',
    games: ['powerball', 'megamillions', 'superKansasCash', 'pick3', 'twoByTwo'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://www.kslottery.com',
  },
  AR: {
    code: 'AR',
    name: 'Arkansas',
    games: ['powerball', 'megamillions', 'naturalStateJackpot', 'cash3', 'cash4', 'luckyForLife'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://www.myarkansaslottery.com',
  },
  NE: {
    code: 'NE',
    name: 'Nebraska',
    games: ['powerball', 'megamillions', 'pick3', 'pick5', 'twoByTwo', 'myDay'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://www.nelottery.com',
  },
  ID: {
    code: 'ID',
    name: 'Idaho',
    games: ['powerball', 'megamillions', 'idahoCash', 'pick3', 'weeklyGrand'],
    timezone: 'America/Boise',
    lotteryUrl: 'https://www.idaholottery.com',
  },
  NM: {
    code: 'NM',
    name: 'New Mexico',
    games: ['powerball', 'megamillions', 'roadrunnerCash', 'pick3', 'pick4'],
    timezone: 'America/Denver',
    lotteryUrl: 'https://www.nmlottery.com',
  },
  ME: {
    code: 'ME',
    name: 'Maine',
    games: ['powerball', 'megamillions', 'megabucks', 'pick3', 'pick4', 'luckyForLife'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.mainelottery.com',
  },
  NH: {
    code: 'NH',
    name: 'New Hampshire',
    games: ['powerball', 'megamillions', 'triStateMegabucks', 'pick3', 'pick4', 'luckyForLife'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.nhlottery.com',
  },
  RI: {
    code: 'RI',
    name: 'Rhode Island',
    games: ['powerball', 'megamillions', 'wildMoney', 'theNumbers', 'luckyForLife'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.rilottery.com',
  },
  VT: {
    code: 'VT',
    name: 'Vermont',
    games: ['powerball', 'megamillions', 'triStateMegabucks', 'pick3', 'pick4', 'luckyForLife'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.vtlottery.com',
  },
  DE: {
    code: 'DE',
    name: 'Delaware',
    games: ['powerball', 'megamillions', 'multiWinLotto', 'play3', 'play4', 'luckyForLife'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.delottery.com',
  },
  DC: {
    code: 'DC',
    name: 'Washington DC',
    games: ['powerball', 'megamillions', 'dc3', 'dc4', 'dc5', 'luckyForLife'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://dclottery.com',
  },
  WV: {
    code: 'WV',
    name: 'West Virginia',
    games: ['powerball', 'megamillions', 'cash25', 'daily3', 'daily4'],
    timezone: 'America/New_York',
    lotteryUrl: 'https://www.wvlottery.com',
  },
  SD: {
    code: 'SD',
    name: 'South Dakota',
    games: ['powerball', 'megamillions', 'dakotaCash', 'wildCard2', 'lottoAmerica'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://lottery.sd.gov',
  },
  MT: {
    code: 'MT',
    name: 'Montana',
    games: ['powerball', 'megamillions', 'montanaCash', 'hotLotto'],
    timezone: 'America/Denver',
    lotteryUrl: 'https://www.montanalottery.com',
  },
  AL: {
    code: 'AL',
    name: 'Alabama',
    games: ['powerball', 'megamillions', 'pick3', 'pick4'],
    timezone: 'America/Chicago',
    lotteryUrl: 'https://www.alabamalottery.com',
  },
};

export function getStateConfig(stateCode: string): StateConfig | null {
  return NATIONWIDE_STATES[stateCode.toUpperCase()] ?? null;
}

export function getAllStateCodes(): string[] {
  return Object.keys(NATIONWIDE_STATES).sort();
}

export function getStatesWithGame(game: string): StateConfig[] {
  return Object.values(NATIONWIDE_STATES)
    .filter(s => s.games.includes(game))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getStateDisplayName(code: string): string {
  return NATIONWIDE_STATES[code]?.name ?? code;
}
