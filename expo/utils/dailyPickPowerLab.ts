export type DigitGame = 'pick3' | 'pick4';

export type DailyPickAnalysis = {
  input: string;
  normalized: string;
  game: DigitGame;
  straight: string;
  boxCombos: string[];
  sum: number;
  rootSum: number;
  pairs: string[];
  hasRepeat: boolean;
  mirror: string;
  oddEvenBalance: string;
  highLowBalance: string;
  lastDigitSum: number;
};

function normalizeDigits(input: string, game: DigitGame): string {
  const length = game === 'pick3' ? 3 : 4;
  return input.replace(/\D/g, '').slice(0, length).padStart(length, '0');
}

function rootSum(sum: number): number {
  let value = sum;
  while (value > 9) {
    value = String(value)
      .split('')
      .reduce((total, digit) => total + Number(digit), 0);
  }
  return value;
}

function permutations(values: string[]): string[] {
  if (values.length <= 1) return values;
  const output = new Set<string>();
  values.forEach((value, index) => {
    const rest = [...values.slice(0, index), ...values.slice(index + 1)];
    permutations(rest).forEach((tail) => output.add(`${value}${tail}`));
  });
  return [...output].sort();
}

function digitPairs(digits: string[]): string[] {
  const pairs = new Set<string>();
  for (let left = 0; left < digits.length; left += 1) {
    for (let right = left + 1; right < digits.length; right += 1) {
      pairs.add(`${digits[left]}${digits[right]}`);
    }
  }
  return [...pairs];
}

function mirrorDigit(digit: number): number {
  return (digit + 5) % 10;
}

export function analyzeDailyPick(input: string, game: DigitGame): DailyPickAnalysis {
  const normalized = normalizeDigits(input, game);
  const digits = normalized.split('');
  const numericDigits = digits.map(Number);
  const sum = numericDigits.reduce((total, digit) => total + digit, 0);
  const oddCount = numericDigits.filter((digit) => digit % 2 === 1).length;
  const highCount = numericDigits.filter((digit) => digit >= 5).length;

  return {
    input,
    normalized,
    game,
    straight: normalized,
    boxCombos: permutations(digits),
    sum,
    rootSum: rootSum(sum),
    pairs: digitPairs(digits),
    hasRepeat: new Set(digits).size !== digits.length,
    mirror: numericDigits.map(mirrorDigit).join(''),
    oddEvenBalance: `${oddCount} odd / ${digits.length - oddCount} even`,
    highLowBalance: `${highCount} high / ${digits.length - highCount} low`,
    lastDigitSum: sum % 10,
  };
}

export function analyzeLatestDailyPick(numbers: number[], game: DigitGame): DailyPickAnalysis {
  return analyzeDailyPick(numbers.join(''), game);
}
