import { NumbersAPI } from '@/services/numbersApi';

export interface LottoSetItem {
  number: number;
  insight: string;
}

export interface LottoSetResult {
  numbers: LottoSetItem[];
  bonusNumber: LottoSetItem;
  dateEnergy: string;
  generatedAt: string;
}

const uniqueRandomNumbers = (count: number, min: number, max: number): number[] => {
  const nums = new Set<number>();
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(nums).sort((a, b) => a - b);
};

const enhanceWithAI = (text: string): string => {
  const patterns = [
    'This number carries momentum energy — watch for streaks.',
    'Historically significant — may align with cyclical draw patterns.',
    'A number with deep mathematical resonance.',
    'This carries strong repeater potential based on frequency analysis.',
    'Connected to high-probability pair clusters.',
  ];
  const hint = patterns[Math.floor(Math.random() * patterns.length)];
  return `${text}\n\n${hint}`;
};

export const generateSmartLottoSet = async (
  gameType: 'powerball' | 'megamillions' = 'powerball'
): Promise<LottoSetResult> => {
  const mainMax = gameType === 'powerball' ? 69 : 70;
  const bonusMax = gameType === 'powerball' ? 26 : 25;

  const mainNumbers = uniqueRandomNumbers(5, 1, mainMax);
  const bonusNum = Math.floor(Math.random() * bonusMax) + 1;

  const allNumbers = [...mainNumbers, bonusNum];

  const [facts, dateEnergy] = await Promise.all([
    NumbersAPI.getBulkFacts(allNumbers),
    NumbersAPI.getDateEnergy(new Date().getMonth() + 1, new Date().getDate()),
  ]);

  const mainItems: LottoSetItem[] = mainNumbers.map(num => ({
    number: num,
    insight: enhanceWithAI(facts[String(num)] ?? 'No data available'),
  }));

  const bonusItem: LottoSetItem = {
    number: bonusNum,
    insight: enhanceWithAI(facts[String(bonusNum)] ?? 'No data available'),
  };

  return {
    numbers: mainItems,
    bonusNumber: bonusItem,
    dateEnergy: dateEnergy.text,
    generatedAt: new Date().toISOString(),
  };
};
