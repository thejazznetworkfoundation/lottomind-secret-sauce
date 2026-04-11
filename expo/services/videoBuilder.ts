import { Platform } from 'react-native';

export interface VideoContent {
  hook: string;
  body: string;
  flex: string;
  cta: string;
  hashtags: string[];
}

export interface BuiltVideo {
  uri: string | null;
  meta: VideoContent;
  status: 'ready' | 'placeholder';
}

export const buildVideo = async (content: VideoContent): Promise<BuiltVideo> => {
  console.log('[VideoBuilder] Building video content:', content.hook);
  return {
    uri: null,
    meta: content,
    status: 'placeholder',
  };
};
