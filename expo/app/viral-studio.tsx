import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Share2,
  Zap,
  RefreshCw,
  Copy,
  Flame,
  Trophy,
  Sparkles,
  Video,
  Send,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import GlossyButton from '@/components/GlossyButton';
import { useGamification } from '@/providers/GamificationProvider';
import { generateViralPost, shareViralContent, type ViralPost, type UserData } from '@/services/viralGenerator';
import { runAutoPost } from '@/services/autoPostEngine';

export default function ViralStudioScreen() {
  console.log('[ViralStudioScreen] rendered');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { credits, streakDays, level, totalGenerations, totalShares, trackShare } = useGamification();

  const [post, setPost] = useState<ViralPost | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;

  const userData: UserData = {
    credits,
    streakDays,
    level: level.title,
    totalGenerations,
    totalShares,
  };

  const handleGenerate = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const newPost = generateViralPost(userData);
    setPost(newPost);
    fadeAnim.setValue(0);
    cardScale.setValue(0.95);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
    console.log('[ViralStudio] Generated new post');
  }, [userData, fadeAnim, cardScale]);

  const handleShare = useCallback(async () => {
    if (!post) return;
    setIsSharing(true);
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await shareViralContent(post.caption, 'LottoMind');
      trackShare();
      Alert.alert('Mind Credits Earned!', '+5 Mind Credits for sharing! Keep posting to earn more.');
    } catch (e) {
      console.log('[ViralStudio] Share error:', e);
    }
    setIsSharing(false);
  }, [post, trackShare]);

  const handleAutoPost = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    const result = await runAutoPost(userData, streakDays);
    if (result.status === 'SHARED') {
      Alert.alert('Posted!', 'Your viral content has been shared.');
    } else if (result.status === 'READY_TO_POST') {
      if (result.content) {
        setPost(result.content);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      }
      Alert.alert('Ready!', 'Content generated and ready to share.');
    } else {
      Alert.alert('Error', 'Could not generate content. Try again.');
    }
  }, [userData, streakDays, fadeAnim]);

  const handleCopyCaption = useCallback(() => {
    if (!post) return;
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Copied!', 'Caption copied to clipboard. Paste it into TikTok, Instagram, or Twitter.');
  }, [post]);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Video size={18} color="#FF4500" />
          <Text style={styles.headerTitle}>Viral Studio</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroIconWrap}>
            <Flame size={36} color="#FF4500" />
          </View>
          <Text style={styles.heroTitle}>Go Viral</Text>
          <Text style={styles.heroSub}>
            Generate share-ready content for TikTok, Instagram & Twitter. Turn your streaks into downloads.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Flame size={14} color="#FF4500" />
            <Text style={styles.statText}>{streakDays}d streak</Text>
          </View>
          <View style={styles.statChip}>
            <Trophy size={14} color={Colors.gold} />
            <Text style={styles.statText}>{credits} credits</Text>
          </View>
          <View style={styles.statChip}>
            <Sparkles size={14} color="#2ECC71" />
            <Text style={styles.statText}>{level.title}</Text>
          </View>
        </View>

        <GlossyButton
          onPress={handleGenerate}
          label="Generate Viral Script"
          icon={<Zap size={20} color="#FFFFFF" />}
          testID="generate-viral-btn"
          variant="green"
          size="large"
        />

        {post && (
          <Animated.View style={[styles.postCard, { opacity: fadeAnim, transform: [{ scale: cardScale }] }]}>
            <View style={styles.postSection}>
              <View style={styles.postLabelRow}>
                <View style={[styles.postLabelDot, { backgroundColor: '#FF4500' }]} />
                <Text style={styles.postLabel}>HOOK</Text>
              </View>
              <Text style={styles.postText}>{post.hook}</Text>
            </View>

            <View style={styles.postDivider} />

            <View style={styles.postSection}>
              <View style={styles.postLabelRow}>
                <View style={[styles.postLabelDot, { backgroundColor: Colors.gold }]} />
                <Text style={styles.postLabel}>BODY</Text>
              </View>
              <Text style={styles.postText}>{post.body}</Text>
            </View>

            <View style={styles.postDivider} />

            <View style={styles.postSection}>
              <View style={styles.postLabelRow}>
                <View style={[styles.postLabelDot, { backgroundColor: '#2ECC71' }]} />
                <Text style={styles.postLabel}>FLEX</Text>
              </View>
              <Text style={styles.postFlexText}>{post.flex}</Text>
            </View>

            <View style={styles.postDivider} />

            <View style={styles.postSection}>
              <View style={styles.postLabelRow}>
                <View style={[styles.postLabelDot, { backgroundColor: '#3498DB' }]} />
                <Text style={styles.postLabel}>CTA</Text>
              </View>
              <Text style={styles.postText}>{post.cta}</Text>
            </View>

            <View style={styles.hashtagsRow}>
              {post.hashtags.map((tag) => (
                <View key={tag} style={styles.hashtagChip}>
                  <Text style={styles.hashtagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleGenerate}
                activeOpacity={0.7}
                testID="regenerate-btn"
              >
                <RefreshCw size={16} color={Colors.gold} />
                <Text style={styles.actionBtnText}>Regenerate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleCopyCaption}
                activeOpacity={0.7}
                testID="copy-caption-btn"
              >
                <Copy size={16} color={Colors.gold} />
                <Text style={styles.actionBtnText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {post && (
          <View style={styles.shareSection}>
            <GlossyButton
              onPress={() => { void handleShare(); }}
              label={isSharing ? 'Sharing...' : 'Share to Social Media'}
              icon={<Share2 size={20} color="#FFFFFF" />}
              disabled={isSharing}
              testID="share-viral-btn"
              variant="gold"
              size="large"
            />

            <TouchableOpacity
              style={styles.autoPostBtn}
              onPress={() => { void handleAutoPost(); }}
              activeOpacity={0.8}
              testID="auto-post-btn"
            >
              <Send size={18} color="#FF4500" />
              <View style={styles.autoPostInfo}>
                <Text style={styles.autoPostTitle}>Auto Post Engine</Text>
                <Text style={styles.autoPostSub}>Generate + share in one tap</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Viral Tips</Text>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>1.</Text>
            <Text style={styles.tipText}>Post when you hit a streak — urgency drives views</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>2.</Text>
            <Text style={styles.tipText}>Use the hook as your opening line in TikTok</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>3.</Text>
            <Text style={styles.tipText}>Screen-record your number generation for authenticity</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>4.</Text>
            <Text style={styles.tipText}>Post before big draw nights for maximum engagement</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>5.</Text>
            <Text style={styles.tipText}>Always include a CTA — "link in bio" drives downloads</Text>
          </View>
        </View>

        <View style={styles.viralFlowCard}>
          <Text style={styles.viralFlowTitle}>The Viral Loop</Text>
          <View style={styles.flowSteps}>
            <View style={styles.flowStep}>
              <View style={[styles.flowStepDot, { backgroundColor: '#FF4500' }]} />
              <Text style={styles.flowStepText}>Hit Streak</Text>
            </View>
            <View style={styles.flowArrow}>
              <Text style={styles.flowArrowText}>→</Text>
            </View>
            <View style={styles.flowStep}>
              <View style={[styles.flowStepDot, { backgroundColor: Colors.gold }]} />
              <Text style={styles.flowStepText}>Generate Content</Text>
            </View>
            <View style={styles.flowArrow}>
              <Text style={styles.flowArrowText}>→</Text>
            </View>
            <View style={styles.flowStep}>
              <View style={[styles.flowStepDot, { backgroundColor: '#2ECC71' }]} />
              <Text style={styles.flowStepText}>Post & Share</Text>
            </View>
            <View style={styles.flowArrow}>
              <Text style={styles.flowArrowText}>→</Text>
            </View>
            <View style={styles.flowStep}>
              <View style={[styles.flowStepDot, { backgroundColor: '#3498DB' }]} />
              <Text style={styles.flowStepText}>New Users</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
  },
  heroSection: {
    alignItems: 'center',
    gap: 10,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 69, 0, 0.25)',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#FF4500',
  },
  heroSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 300,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  postCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  postSection: {
    paddingVertical: 14,
    gap: 6,
  },
  postLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postLabelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  postLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  postText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  postFlexText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.gold,
    lineHeight: 22,
  },
  postDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 14,
  },
  hashtagChip: {
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  hashtagText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FF4500',
  },
  postActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.goldMuted,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  shareSection: {
    gap: 12,
  },
  autoPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255, 69, 0, 0.06)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  autoPostInfo: {
    flex: 1,
    gap: 2,
  },
  autoPostTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#FF4500',
  },
  autoPostSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  tipsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipBullet: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#FF4500',
    width: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  viralFlowCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.15)',
  },
  viralFlowTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#FF4500',
    textAlign: 'center',
  },
  flowSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  flowStep: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  flowStepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  flowStepText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  flowArrow: {
    paddingHorizontal: 2,
  },
  flowArrowText: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '700' as const,
  },
});
