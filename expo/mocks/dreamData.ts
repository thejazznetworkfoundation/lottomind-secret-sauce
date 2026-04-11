export interface DreamSymbolEntry {
  keyword: string;
  numbers: number[];
  category: string;
}

export const DREAM_SYMBOLS: DreamSymbolEntry[] = [
  { keyword: 'water', numbers: [7, 21, 33, 47], category: 'elements' },
  { keyword: 'drowning', numbers: [9, 18, 36, 54], category: 'elements' },
  { keyword: 'ocean', numbers: [3, 14, 28, 52], category: 'elements' },
  { keyword: 'rain', numbers: [11, 22, 44, 55], category: 'elements' },
  { keyword: 'fire', numbers: [1, 13, 31, 43], category: 'elements' },
  { keyword: 'storm', numbers: [8, 16, 32, 48], category: 'elements' },
  { keyword: 'wind', numbers: [5, 15, 25, 45], category: 'elements' },
  { keyword: 'earth', numbers: [4, 12, 24, 40], category: 'elements' },
  { keyword: 'ice', numbers: [6, 19, 38, 57], category: 'elements' },
  { keyword: 'snow', numbers: [2, 20, 39, 58], category: 'elements' },
  { keyword: 'money', numbers: [8, 18, 28, 38], category: 'wealth' },
  { keyword: 'gold', numbers: [7, 17, 27, 37], category: 'wealth' },
  { keyword: 'coins', numbers: [1, 11, 21, 51], category: 'wealth' },
  { keyword: 'treasure', numbers: [9, 19, 29, 49], category: 'wealth' },
  { keyword: 'diamonds', numbers: [3, 13, 23, 53], category: 'wealth' },
  { keyword: 'wallet', numbers: [5, 15, 35, 55], category: 'wealth' },
  { keyword: 'bank', numbers: [10, 20, 30, 60], category: 'wealth' },
  { keyword: 'flying', numbers: [5, 15, 25, 55], category: 'freedom' },
  { keyword: 'falling', numbers: [4, 14, 24, 44], category: 'freedom' },
  { keyword: 'running', numbers: [6, 16, 26, 46], category: 'freedom' },
  { keyword: 'climbing', numbers: [12, 22, 32, 42], category: 'freedom' },
  { keyword: 'jumping', numbers: [3, 23, 33, 63], category: 'freedom' },
  { keyword: 'snake', numbers: [2, 12, 22, 42], category: 'animals' },
  { keyword: 'dog', numbers: [3, 13, 23, 43], category: 'animals' },
  { keyword: 'cat', numbers: [9, 19, 29, 59], category: 'animals' },
  { keyword: 'bird', numbers: [7, 17, 37, 47], category: 'animals' },
  { keyword: 'fish', numbers: [6, 16, 26, 56], category: 'animals' },
  { keyword: 'horse', numbers: [10, 20, 30, 50], category: 'animals' },
  { keyword: 'spider', numbers: [8, 18, 48, 58], category: 'animals' },
  { keyword: 'lion', numbers: [1, 11, 31, 41], category: 'animals' },
  { keyword: 'butterfly', numbers: [4, 14, 34, 44], category: 'animals' },
  { keyword: 'death', numbers: [13, 31, 44, 69], category: 'dark' },
  { keyword: 'blood', numbers: [4, 14, 41, 64], category: 'dark' },
  { keyword: 'darkness', numbers: [6, 16, 36, 66], category: 'dark' },
  { keyword: 'ghost', numbers: [3, 33, 39, 63], category: 'dark' },
  { keyword: 'monster', numbers: [11, 21, 41, 61], category: 'dark' },
  { keyword: 'baby', numbers: [1, 10, 21, 31], category: 'life' },
  { keyword: 'wedding', numbers: [2, 22, 32, 52], category: 'life' },
  { keyword: 'birth', numbers: [1, 9, 19, 39], category: 'life' },
  { keyword: 'family', numbers: [4, 14, 24, 34], category: 'life' },
  { keyword: 'mother', numbers: [5, 15, 25, 45], category: 'life' },
  { keyword: 'father', numbers: [6, 16, 26, 46], category: 'life' },
  { keyword: 'child', numbers: [7, 17, 27, 37], category: 'life' },
  { keyword: 'love', numbers: [2, 14, 22, 44], category: 'emotions' },
  { keyword: 'fear', numbers: [13, 31, 43, 49], category: 'emotions' },
  { keyword: 'anger', numbers: [8, 18, 38, 48], category: 'emotions' },
  { keyword: 'joy', numbers: [3, 7, 21, 33], category: 'emotions' },
  { keyword: 'sadness', numbers: [9, 19, 39, 59], category: 'emotions' },
  { keyword: 'anxiety', numbers: [11, 23, 37, 51], category: 'emotions' },
  { keyword: 'peace', numbers: [5, 10, 25, 50], category: 'emotions' },
  { keyword: 'house', numbers: [4, 24, 34, 64], category: 'places' },
  { keyword: 'school', numbers: [7, 17, 27, 57], category: 'places' },
  { keyword: 'hospital', numbers: [9, 19, 49, 69], category: 'places' },
  { keyword: 'church', numbers: [3, 13, 33, 63], category: 'places' },
  { keyword: 'forest', numbers: [5, 15, 35, 55], category: 'places' },
  { keyword: 'mountain', numbers: [8, 28, 38, 68], category: 'places' },
  { keyword: 'beach', numbers: [6, 16, 36, 46], category: 'places' },
  { keyword: 'car', numbers: [10, 20, 40, 60], category: 'objects' },
  { keyword: 'door', numbers: [1, 11, 41, 51], category: 'objects' },
  { keyword: 'key', numbers: [7, 17, 47, 67], category: 'objects' },
  { keyword: 'mirror', numbers: [2, 12, 22, 52], category: 'objects' },
  { keyword: 'book', numbers: [3, 23, 33, 53], category: 'objects' },
  { keyword: 'phone', numbers: [8, 18, 28, 58], category: 'objects' },
  { keyword: 'ring', numbers: [9, 29, 39, 49], category: 'objects' },
  { keyword: 'star', numbers: [5, 15, 25, 55], category: 'celestial' },
  { keyword: 'moon', numbers: [2, 12, 32, 62], category: 'celestial' },
  { keyword: 'sun', numbers: [1, 11, 21, 41], category: 'celestial' },
  { keyword: 'sky', numbers: [7, 27, 37, 47], category: 'celestial' },
  { keyword: 'rainbow', numbers: [7, 14, 21, 42], category: 'celestial' },
];

export function findSymbolNumbers(symbol: string): number[] {
  const normalized = symbol.toLowerCase().trim();
  const match = DREAM_SYMBOLS.find(
    (d) => normalized.includes(d.keyword) || d.keyword.includes(normalized)
  );
  return match?.numbers ?? [];
}

export function getCategoryForSymbol(symbol: string): string {
  const normalized = symbol.toLowerCase().trim();
  const match = DREAM_SYMBOLS.find(
    (d) => normalized.includes(d.keyword) || d.keyword.includes(normalized)
  );
  return match?.category ?? 'unknown';
}
