const BASE_URL = "https://numbersapi.com";

interface NumberFact {
  text: string;
  number: number;
  found: boolean;
  type: string;
}

interface BulkFacts {
  [key: string]: string;
}

export const NumbersAPI = {
  getRandomFact: async (): Promise<NumberFact> => {
    try {
      const res = await fetch(`${BASE_URL}/random/trivia?json`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    } catch (error) {
      console.log('[NumbersAPI] getRandomFact error:', error);
      return { text: 'Could not fetch number fact', number: 0, found: false, type: 'trivia' };
    }
  },

  getNumberFact: async (number: number): Promise<NumberFact> => {
    try {
      const res = await fetch(`${BASE_URL}/${number}/trivia?json`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    } catch (error) {
      console.log('[NumbersAPI] getNumberFact error:', error);
      return { text: `No data available for ${number}`, number, found: false, type: 'trivia' };
    }
  },

  getBulkFacts: async (numbersArray: number[]): Promise<BulkFacts> => {
    try {
      const numbers = numbersArray.join(",");
      const res = await fetch(`${BASE_URL}/${numbers}?json`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    } catch (error) {
      console.log('[NumbersAPI] getBulkFacts error:', error);
      const fallback: BulkFacts = {};
      numbersArray.forEach(n => { fallback[String(n)] = 'No data'; });
      return fallback;
    }
  },

  getDateEnergy: async (month: number, day: number): Promise<NumberFact> => {
    try {
      const res = await fetch(`${BASE_URL}/${month}/${day}/date?json`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    } catch (error) {
      console.log('[NumbersAPI] getDateEnergy error:', error);
      return { text: 'Could not fetch date energy', number: 0, found: false, type: 'date' };
    }
  },
};
