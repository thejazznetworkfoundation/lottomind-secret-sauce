import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { GameType, LiveDraw } from '@/types/lottery';

export interface ScannedTicket {
  numbers: number[];
  bonusNumber: number | null;
  gameDetected: GameType | null;
  confidence: number;
  rawText: string;
}

export interface TicketCheckResult {
  ticket: ScannedTicket;
  matchedDraws: {
    draw: LiveDraw;
    mainMatches: number[];
    bonusMatch: boolean;
    matchCount: number;
    prize: string;
  }[];
  bestMatch: number;
  analysis: string;
}

const ticketSchema = z.object({
  numbers: z.array(z.number()).describe('Main lottery numbers found on the ticket, sorted ascending'),
  bonusNumber: z.number().nullable().describe('The bonus/powerball/megaball number if found, null otherwise'),
  gameType: z.enum(['powerball', 'megamillions', 'unknown']).describe('Detected game type from ticket branding/format'),
  confidence: z.number().min(0).max(100).describe('Confidence percentage in the extracted numbers'),
  rawText: z.string().describe('Raw text visible on the ticket'),
});

export async function scanTicketImage(imageBase64: string): Promise<ScannedTicket> {
  console.log('[TicketScanner] Scanning ticket image...');

  const result = await generateObject({
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are a lottery ticket scanner. Analyze this lottery ticket image and extract:
1. The main lottery numbers (typically 5 numbers for Powerball/Mega Millions)
2. The bonus number (Powerball or Mega Ball)
3. The game type if visible (Powerball or Mega Millions)
4. Your confidence in the extraction

If you cannot clearly read the numbers, do your best and lower the confidence.
If no ticket is visible, return empty numbers array with 0 confidence.`,
          },
          {
            type: 'image',
            image: imageBase64,
          },
        ],
      },
    ],
    schema: ticketSchema,
  });

  console.log('[TicketScanner] Scan result:', JSON.stringify(result));

  return {
    numbers: result.numbers.sort((a, b) => a - b),
    bonusNumber: result.bonusNumber,
    gameDetected: result.gameType === 'unknown' ? null : result.gameType as GameType,
    confidence: result.confidence,
    rawText: result.rawText,
  };
}

export function checkTicketAgainstDraws(
  ticket: ScannedTicket,
  draws: LiveDraw[],
  game: GameType
): TicketCheckResult {
  console.log('[TicketScanner] Checking ticket against', draws.length, 'draws');

  const matchedDraws = draws.map((draw) => {
    const mainMatches = ticket.numbers.filter((n) => draw.numbers.includes(n));
    const bonusMatch = ticket.bonusNumber !== null && draw.bonusNumber === ticket.bonusNumber;
    const matchCount = mainMatches.length + (bonusMatch ? 1 : 0);

    let prize = 'No prize';
    if (game === 'powerball') {
      if (mainMatches.length === 5 && bonusMatch) prize = 'JACKPOT';
      else if (mainMatches.length === 5) prize = '$1,000,000';
      else if (mainMatches.length === 4 && bonusMatch) prize = '$50,000';
      else if (mainMatches.length === 4) prize = '$100';
      else if (mainMatches.length === 3 && bonusMatch) prize = '$100';
      else if (mainMatches.length === 3) prize = '$7';
      else if (mainMatches.length === 2 && bonusMatch) prize = '$7';
      else if (mainMatches.length === 1 && bonusMatch) prize = '$4';
      else if (bonusMatch) prize = '$4';
    } else {
      if (mainMatches.length === 5 && bonusMatch) prize = 'JACKPOT';
      else if (mainMatches.length === 5) prize = '$1,000,000';
      else if (mainMatches.length === 4 && bonusMatch) prize = '$10,000';
      else if (mainMatches.length === 4) prize = '$500';
      else if (mainMatches.length === 3 && bonusMatch) prize = '$200';
      else if (mainMatches.length === 3) prize = '$10';
      else if (mainMatches.length === 2 && bonusMatch) prize = '$10';
      else if (mainMatches.length === 1 && bonusMatch) prize = '$4';
      else if (bonusMatch) prize = '$2';
    }

    return { draw, mainMatches, bonusMatch, matchCount, prize };
  });

  matchedDraws.sort((a, b) => b.matchCount - a.matchCount);

  const bestMatch = matchedDraws[0]?.matchCount ?? 0;

  let analysis = '';
  if (bestMatch === 0) {
    analysis = 'No matches found against recent draws. Keep playing!';
  } else if (bestMatch <= 2) {
    analysis = `Matched up to ${bestMatch} number${bestMatch > 1 ? 's' : ''} in recent draws. Close but no prize yet.`;
  } else if (bestMatch <= 4) {
    analysis = `Strong showing with ${bestMatch} matches! You may have won a prize.`;
  } else {
    analysis = `Amazing match of ${bestMatch}! Check your ticket carefully - this could be a big win!`;
  }

  return { ticket, matchedDraws: matchedDraws.slice(0, 10), bestMatch, analysis };
}

export function manualTicketEntry(
  numbers: number[],
  bonusNumber: number | null,
  game: GameType
): ScannedTicket {
  return {
    numbers: numbers.sort((a, b) => a - b),
    bonusNumber,
    gameDetected: game,
    confidence: 100,
    rawText: 'Manual entry',
  };
}
