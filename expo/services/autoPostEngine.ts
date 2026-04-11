import { generateViralPost, type UserData, type ViralPost } from './viralGenerator';
import { shareToTikTok } from './tiktokShare';

export type AutoPostStatus = 'READY_TO_POST' | 'SHARED' | 'ERROR';

export interface AutoPostResult {
  status: AutoPostStatus;
  content: ViralPost | null;
  error?: string;
}

export const runAutoPost = async (user: UserData, streak: number): Promise<AutoPostResult> => {
  console.log('[AutoPost] Running auto post engine for streak:', streak);
  try {
    const userData: UserData = { ...user, streakDays: streak };
    const content = generateViralPost(userData);
    console.log('[AutoPost] Generated viral content:', content.hook);

    const shared = await shareToTikTok(content.caption);

    return {
      status: shared ? 'SHARED' : 'READY_TO_POST',
      content,
    };
  } catch (err) {
    console.log('[AutoPost] Error:', err);
    return {
      status: 'ERROR',
      content: null,
      error: String(err),
    };
  }
};

export const generateAutoCaption = (user: UserData): string => {
  const post = generateViralPost(user);
  return post.caption;
};
