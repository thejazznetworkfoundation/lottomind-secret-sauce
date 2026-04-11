import { Share, Platform } from 'react-native';

export const shareToTikTok = async (caption: string): Promise<boolean> => {
  console.log('[TikTokShare] Sharing content...');
  try {
    const result = await Share.share({
      message: caption,
      title: 'LottoMind AI',
    });
    console.log('[TikTokShare] Share result:', result.action);
    return result.action === Share.sharedAction;
  } catch (err) {
    console.log('[TikTokShare] Share error:', err);
    return false;
  }
};
