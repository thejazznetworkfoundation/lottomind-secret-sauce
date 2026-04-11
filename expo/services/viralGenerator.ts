import { Share, Platform } from 'react-native';

export interface UserData {
  credits: number;
  streakDays: number;
  level: string;
  totalGenerations: number;
  totalShares: number;
}

export interface ViralPost {
  hook: string;
  body: string;
  flex: string;
  cta: string;
  hashtags: string[];
  caption: string;
}

const HOOKS = [
  "I just hit a {streak}-day streak on LottoMind AI… 🤯",
  "Day {streak} of using AI to pick my lotto numbers 🔥",
  "This app just predicted numbers that matched 3 draws 👀",
  "POV: You let AI pick your lottery numbers 🎯",
  "I earned {credits} credits just answering trivia 💰",
  "My AI-generated numbers are actually hitting 🎰",
  "LottoMind AI just gave me a 95% confidence pick 🧠",
  "When AI meets lottery strategy... things get interesting 🔮",
];

const BODIES = [
  "The AI analyzes hot/cold numbers, frequency patterns, and momentum scoring to generate picks.",
  "I've been playing trivia every day to earn credits and unlock premium predictions.",
  "The dream oracle turned my dream about flying into actual lottery numbers 😂",
  "It uses real-time draw data from every state to build its predictions.",
  "My numerology number + AI analysis = a combination I've never tried before.",
  "The heatmap shows exactly which numbers are trending and which are overdue.",
];

const FLEXES = [
  "Unlocked AI Lotto Analyzer 🔓",
  "VIP Lucky Insights activated 💎",
  "Premium predictions unlocked 👑",
  "Mystery Lotto Box opened — got an exclusive number set 🎁",
  "{credits} credits earned from trivia alone 🧠",
  "Level: {level} — grinding my way to the top 📈",
];

const CTAS = [
  "Download LottoMind AI and try it before tonight's draw",
  "Link in bio — get your free AI predictions now",
  "Try it free and earn credits by playing trivia",
  "Your lucky numbers are waiting — download LottoMind AI",
  "Stop guessing. Start using AI. LottoMind AI.",
];

const HASHTAGS = [
  '#LottoMindAI', '#LotteryStrategy', '#AIpredictions',
  '#PowerBall', '#MegaMillions', '#LuckyNumbers',
  '#LottoTikTok', '#WinningNumbers', '#LotteryTips',
  '#AILottery', '#NumberGame', '#JackpotVibes',
  '#LottoLife', '#SmartPlay', '#TriviaRewards',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template: string, user: UserData): string {
  return template
    .replace('{streak}', String(user.streakDays))
    .replace('{credits}', String(user.credits))
    .replace('{level}', user.level);
}

export function generateViralPost(user: UserData): ViralPost {
  const hook = fillTemplate(pickRandom(HOOKS), user);
  const body = fillTemplate(pickRandom(BODIES), user);
  const flex = fillTemplate(pickRandom(FLEXES), user);
  const cta = pickRandom(CTAS);

  const selectedHashtags: string[] = [];
  const shuffled = [...HASHTAGS].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 5; i++) {
    selectedHashtags.push(shuffled[i]);
  }

  const caption = [hook, '', body, '', flex, '', cta, '', selectedHashtags.join(' ')].join('\n');

  return { hook, body, flex, cta, hashtags: selectedHashtags, caption };
}

export function generateTikTokScript(user: UserData): ViralPost {
  return generateViralPost(user);
}

export function generateShareCard(
  name: string,
  numbers: number[],
  insight: string,
): string {
  const mainNums = numbers.slice(0, -1).join(' • ');
  const bonus = numbers[numbers.length - 1];
  return [
    '🔥 LOTTO MIND AI 🔥',
    '',
    `Name: ${name}`,
    'Lucky Numbers:',
    `${mainNums} + ${bonus}`,
    '',
    `"${insight}"`,
    '',
    '👉 Try yours now with LottoMind AI',
  ].join('\n');
}

export async function shareViralContent(content: string, title?: string): Promise<boolean> {
  try {
    const result = await Share.share({
      message: content,
      title: title ?? 'LottoMind AI',
    });
    console.log('[ViralGenerator] Share result:', result.action);
    return result.action === Share.sharedAction;
  } catch (error) {
    console.log('[ViralGenerator] Share error:', error);
    return false;
  }
}
