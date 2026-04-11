import { generateText } from '@rork-ai/toolkit-sdk';
import { getStateConfig } from '@/config/states';

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

export async function sendAIMessage(
  userMessage: string,
  systemContext: string,
  history: AIChatMessage[] = [],
): Promise<string> {
  console.log('[aiBackend] Sending message to AI backend');

  if (OPENAI_API_KEY) {
    return sendOpenAIMessage(userMessage, systemContext, history);
  }

  const messages: AIChatMessage[] = [
    {
      role: 'user',
      content: `SYSTEM CONTEXT (do not repeat this to the user):\n${systemContext}\n\n---\nConversation history and current request follow.`,
    },
    ...history.slice(-10),
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await generateText({
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    console.log('[aiBackend] AI response received, length:', response.length);
    return response;
  } catch (error) {
    console.log('[aiBackend] AI request failed:', error);
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
}

async function sendOpenAIMessage(
  userMessage: string,
  systemContext: string,
  history: AIChatMessage[] = [],
): Promise<string> {
  console.log('[aiBackend] Using OpenAI direct API');

  const messages = [
    { role: 'system' as const, content: systemContext },
    ...history.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: userMessage },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'unknown');
      console.log('[aiBackend] OpenAI API error:', response.status, errorBody);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    console.log('[aiBackend] OpenAI response received, length:', text.length);
    return text;
  } catch (error) {
    console.log('[aiBackend] OpenAI request failed:', error);
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
}

export function buildNationwideContext(params: {
  stateCode: string;
  gameName: string;
  hotNumbers: number[];
  coldNumbers: number[];
  drawCount: number;
  latestDraw: string | null;
  jackpotInfo?: string;
}): string {
  const stateConfig = getStateConfig(params.stateCode);
  const stateName = stateConfig?.name ?? params.stateCode;
  const stateGames = stateConfig?.games?.join(', ') ?? 'N/A';

  return [
    'NATIONWIDE LOTTERY ENGINE CONTEXT',
    `User state: ${stateName} (${params.stateCode})`,
    `Available games in ${stateName}: ${stateGames}`,
    `Current game focus: ${params.gameName}`,
    `Recent draws analyzed: ${params.drawCount}`,
    `Latest draw: ${params.latestDraw ?? 'Unavailable'}`,
    `Hot numbers (trending): ${params.hotNumbers.slice(0, 8).join(', ')}`,
    `Cold numbers (overdue): ${params.coldNumbers.slice(0, 8).join(', ')}`,
    params.jackpotInfo ? `Jackpot info: ${params.jackpotInfo}` : '',
  ].filter(Boolean).join('\n');
}

export function buildLottoSystemContext(params: {
  gameName: string;
  mainRange: number;
  bonusRange: number;
  bonusName: string;
  hotNumbers: number[];
  coldNumbers: number[];
  latestDraw: string | null;
  recentDrawCount: number;
  pick3Summary: string;
  pick4Summary: string;
  pickState: string;
  jackpotInfo?: string;
}): string {
  const stateConfig = getStateConfig(params.pickState);
  const stateName = stateConfig?.name ?? params.pickState;
  const stateGames = stateConfig?.games?.join(', ') ?? 'N/A';

  return [
    'You are LottoMind AI, a premium nationwide lottery intelligence assistant.',
    `Powered by a multi-state lottery engine covering 40+ US states.`,
    '',
    `== NATIONWIDE ENGINE ==`,
    `User state: ${stateName} (${params.pickState})`,
    `Available games in ${stateName}: ${stateGames}`,
    `Current game: ${params.gameName} (main: 1-${params.mainRange}, ${params.bonusName}: 1-${params.bonusRange}).`,
    `Recent draws analyzed: ${params.recentDrawCount}.`,
    `Latest draw: ${params.latestDraw ?? 'Unavailable'}.`,
    `Hot numbers (trending up): ${params.hotNumbers.slice(0, 8).join(', ')}.`,
    `Cold numbers (overdue): ${params.coldNumbers.slice(0, 8).join(', ')}.`,
    '',
    `== PICK 3 & PICK 4 ==`,
    `${params.pick3Summary}`,
    `${params.pick4Summary}`,
    '',
    params.jackpotInfo ? `== JACKPOTS ==\n${params.jackpotInfo}` : '',
    '',
    `== AI RULES ==`,
    `- Never promise or imply winning certainty.`,
    `- Be concise, practical, and data-driven.`,
    `- Reference live trend data and the nationwide engine when giving suggestions.`,
    `- Use confidence percentages when recommending numbers.`,
    `- If asked about dreams, interpret symbolically and map to numbers.`,
    `- When user asks about their state, reference the available games for that state.`,
    `- Support multi-state queries (e.g. "What games does Michigan have?").`,
  ].filter(Boolean).join('\n');
}
