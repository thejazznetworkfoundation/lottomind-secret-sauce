import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Brain, User, Sparkles, Radio, TrendingUp, Dice3, Dice4, MapPin, ScanLine, BarChart3, ShoppingBag } from 'lucide-react-native';
import VoiceRecordButton from '@/components/VoiceRecordButton';
import SpeakButton from '@/components/SpeakButton';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { useLotto } from '@/providers/LottoProvider';
import { useJackpot } from '@/providers/JackpotProvider';
import { usePro } from '@/providers/ProProvider';
import { useRouter } from 'expo-router';
import { Lock, Crown } from 'lucide-react-native';
import { GAME_CONFIGS } from '@/constants/games';
import { useRorkAgent, createRorkTool } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import LottoBall from '@/components/LottoBall';
import GlossyButton from '@/components/GlossyButton';
import { GeneratedSet, StrategyType } from '@/types/lottery';
import { interpretDream } from '@/utils/dreamInterpreter';
import { buildLottoSystemContext } from '@/utils/aiBackend';

const SUGGESTIONS = [
  'Use live hot trends for today',
  'Generate a balanced set with strong momentum',
  'Give me smart Pick 3 and Pick 4 numbers',
  'I dreamed I was flying over a golden city',
  'What are the latest Pick 3 and Pick 4 results?',
  'What are current jackpot amounts?',
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPro, canUseChat, freeChatUsesLeft, useChatUse } = usePro();
  const {
    currentGame,
    generate,
    latestDraw,
    hotNumbers,
    coldNumbers,
    liveDraws,
    pick3Summary,
    pick4Summary,
    pickState,
    stateName,
    stateGames,
  } = useLotto();
  const { jackpots } = useJackpot();
  const config = GAME_CONFIGS[currentGame];
  const [input, setInput] = useState<string>('');
  const [generatedSet, setGeneratedSet] = useState<GeneratedSet | null>(null);
  const [digitPicks, setDigitPicks] = useState<{ pick3: string[]; pick4: string[] } | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const priceBlinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(priceBlinkAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(priceBlinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [priceBlinkAnim]);

  const { messages, sendMessage } = useRorkAgent({
    tools: {
      generateLotteryNumbers: createRorkTool({
        description: `Generate lottery numbers for ${config.name} using the in-app live trend model.`,
        zodSchema: z.object({
          strategy: z.enum(['hot', 'cold', 'balanced']).describe('The strategy to apply to the prediction model'),
        }),
        execute(toolInput) {
          const result = generate(toolInput.strategy as StrategyType);
          setGeneratedSet(result);
          return `Generated ${config.name} numbers with ${toolInput.strategy} strategy: ${result.numbers.join(', ')} + ${config.bonusName} ${result.bonusNumber}. Confidence ${result.prediction.confidence}%. Source ${result.prediction.source}. Reasons: ${result.prediction.reasons.join('; ')}`;
        },
      }),
      generateDreamDigitPicks: createRorkTool({
        description: `Interpret a dream and generate Pick 3 (3-digit) and Pick 4 (4-digit) lottery numbers based on dream symbols, emotions, and intensity. Use this when the user describes a dream or asks for dream-based digit picks.`,
        zodSchema: z.object({
          dream: z.string().describe('The dream description from the user'),
        }),
        async execute(toolInput) {
          try {
            const result = await interpretDream(toolInput.dream, currentGame);
            setDigitPicks({ pick3: result.pick3, pick4: result.pick4 });
            const symbolInfo = result.symbolMap.map(s => `${s.symbol} (${s.category}): ${s.numbers.join(', ')}`).join('; ');
            return `Dream interpreted! Symbols: ${symbolInfo}. Meaning: ${result.interpretation.meaning}. Emotions: ${result.interpretation.emotions.join(', ')}. Intensity: ${Math.round(result.interpretation.intensity * 100)}%. Pick 3: ${result.pick3.join(', ')}. Pick 4: ${result.pick4.join(', ')}. Lucky numbers: ${result.finalPick.join(', ')} + bonus ${result.bonusNumber}.`;
          } catch (err) {
            console.log('[Chat] Dream digit pick error:', err);
            return 'Failed to interpret dream. Please try again.';
          }
        },
      }),
      explainPredictionModel: createRorkTool({
        description: 'Explain how the in-app lottery prediction model works using the latest live data context.',
        zodSchema: z.object({
          detail: z.enum(['short', 'full']).describe('How detailed the explanation should be'),
        }),
        execute(toolInput) {
          const latest = latestDraw
            ? `${latestDraw.drawDate}: ${latestDraw.numbers.join(', ')} + ${latestDraw.bonusNumber}`
            : 'Unavailable';
          return `${toolInput.detail === 'full' ? 'Full' : 'Short'} model explanation for ${config.name}. Recent live draws analyzed: ${liveDraws.length}. Latest draw: ${latest}. Hot signals: ${hotNumbers.slice(0, 5).join(', ')}. Cold signals: ${coldNumbers.slice(0, 5).join(', ')}. Model inputs: frequency, recency, momentum, pair trends.`;
        },
      }),
      generateSmartPickDigits: createRorkTool({
        description: 'Generate smart Pick 3 and Pick 4 digit lottery numbers using live result trends and hot digit analysis. Use this when the user asks for Pick 3, Pick 4, digit picks, or daily number suggestions.',
        zodSchema: z.object({
          mode: z.enum(['hot', 'balanced', 'random']).describe('Strategy: hot uses trending digits, balanced mixes hot and cold, random is pure chance'),
        }),
        execute(toolInput) {
          const hotDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          let p3: number[];
          let p4: number[];
          if (toolInput.mode === 'hot') {
            p3 = hotDigits.slice(0, 3);
            p4 = hotDigits.slice(0, 4);
          } else if (toolInput.mode === 'balanced') {
            p3 = [hotDigits[0], hotDigits[4], hotDigits[8]];
            p4 = [hotDigits[0], hotDigits[3], hotDigits[6], hotDigits[9]];
          } else {
            p3 = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10));
            p4 = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
          }
          const p3Str = p3.map(String);
          const p4Str = p4.map(String);
          setDigitPicks({ pick3: [p3Str.join('')], pick4: [p4Str.join('')] });
          return `Generated smart digit picks (${toolInput.mode} mode). Pick 3: ${p3.join('-')}. Pick 4: ${p4.join('-')}. Live context: ${pick3Summary}. ${pick4Summary}. State: ${pickState}. Strategy used: ${toolInput.mode}. These are AI-suggested numbers based on trend analysis.`;
        },
      }),
    },
  });

  const handleSend = useCallback(
    (text?: string) => {
      const message = text ?? input.trim();
      if (!message) {
        return;
      }

      if (!isPro) {
        const consumed = useChatUse();
        if (!consumed) {
          router.push('/paywall');
          return;
        }
      }

      setGeneratedSet(null);
      setDigitPicks(null);

      const jackpotStr = jackpots.map(j => `${j.gameName}: ${j.currentJackpot}${j.cashValue ? ` (cash: ${j.cashValue})` : ''}${j.isHuge ? ' [MASSIVE JACKPOT]' : ''}`).join('; ');

      const systemContext = buildLottoSystemContext({
        gameName: config.name,
        mainRange: config.mainRange,
        bonusRange: config.bonusRange,
        bonusName: config.bonusName,
        hotNumbers,
        coldNumbers,
        latestDraw: latestDraw
          ? `${latestDraw.drawDate}: ${latestDraw.numbers.join(', ')} + ${latestDraw.bonusNumber}`
          : null,
        recentDrawCount: liveDraws.length,
        pick3Summary,
        pick4Summary,
        pickState,
        jackpotInfo: jackpotStr || undefined,
      });

      const rules = [
        'Use generateLotteryNumbers when user asks for picks for Powerball/Mega Millions.',
        'Use generateSmartPickDigits for Pick 3, Pick 4, digit suggestions.',
        'Use generateDreamDigitPicks when user describes a dream.',
        'Use explainPredictionModel when user asks how the model works.',
      ].join(' ');

      sendMessage(`${systemContext}\n\nTool rules: ${rules}\n\nUser request: ${message}`);
      setInput('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 180);
    },
    [config.bonusName, config.bonusRange, config.mainRange, config.name, hotNumbers, coldNumbers, input, latestDraw, liveDraws.length, sendMessage, pick3Summary, pick4Summary, pickState, jackpots, isPro, useChatUse, router]
  );

  const renderMessage = useCallback(
    ({ item: message }: { item: typeof messages[number] }) => {
      const isUser = message.role === 'user';

      return (
        <View style={[styles.messageRow, isUser && styles.userRow]}>
          {!isUser ? (
            <View style={styles.avatarAI}>
              <Brain size={16} color={Colors.gold} />
            </View>
          ) : null}
          <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
            {message.parts.map((part, index) => {
              if (part.type === 'text') {
                const displayText = isUser
                  ? part.text.split('User request: ').pop() ?? part.text
                  : part.text;

                return (
                  <View key={`${message.id}-${index}`}>
                    <Text
                      style={[styles.messageText, isUser && styles.userText]}
                    >
                      {displayText}
                    </Text>
                    {!isUser && displayText.trim().length > 0 && (
                      <View style={styles.speakRow}>
                        <SpeakButton text={displayText} size={28} color={Colors.gold} />
                      </View>
                    )}
                  </View>
                );
              }

              if (part.type === 'tool') {
                if (part.state === 'input-streaming' || part.state === 'input-available') {
                  return (
                    <View key={`${message.id}-${index}`} style={styles.toolLoading}>
                      <ActivityIndicator size="small" color={Colors.gold} />
                      <Text style={styles.toolText}>Crunching live draw signals...</Text>
                    </View>
                  );
                }

                if (part.state === 'output-available' && digitPicks) {
                  return (
                    <View key={`${message.id}-${index}`} style={styles.digitPicksResult}>
                      <View style={styles.digitPickRow}>
                        <View style={styles.digitPickCard}>
                          <View style={styles.digitPickCardHeader}>
                            <Dice3 size={16} color="#2ECC71" />
                            <Text style={styles.digitPickCardTitle}>Pick 3</Text>
                          </View>
                          {digitPicks.pick3.map((num, idx) => (
                            <View key={`cp3-${idx}`} style={styles.digitPickNumBox}>
                              <Text style={styles.digitPickNumText}>{num}</Text>
                            </View>
                          ))}
                        </View>
                        <View style={styles.digitPickCard}>
                          <View style={styles.digitPickCardHeader}>
                            <Dice4 size={16} color="#3498DB" />
                            <Text style={[styles.digitPickCardTitle, { color: '#3498DB' }]}>Pick 4</Text>
                          </View>
                          {digitPicks.pick4.map((num, idx) => (
                            <View key={`cp4-${idx}`} style={styles.digitPickNumBox4}>
                              <Text style={styles.digitPickNumText4}>{num}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      <Text style={styles.digitPickDisclaimer}>Dream-derived picks · Entertainment only</Text>
                    </View>
                  );
                }

                if (part.state === 'output-available' && generatedSet) {
                  return (
                    <View key={`${message.id}-${index}`} style={styles.toolResult}>
                      <View style={styles.toolHeader}>
                        <View style={styles.toolBadge}>
                          <TrendingUp size={14} color={Colors.gold} />
                          <Text style={styles.toolBadgeText}>{generatedSet.prediction.confidence}% confidence</Text>
                        </View>
                        <Text style={styles.toolMeta}>
                          {generatedSet.prediction.source === 'live-ml' ? 'Live ML blend' : 'Fallback'}
                        </Text>
                      </View>
                      <View style={styles.toolBalls}>
                        {generatedSet.numbers.map((num, itemIndex) => (
                          <LottoBall key={`chat-${generatedSet.id}-${num}`} number={num} size={40} delay={itemIndex * 80} />
                        ))}
                        <Text style={styles.toolPlus}>+</Text>
                        <LottoBall
                          number={generatedSet.bonusNumber}
                          isBonus
                          size={40}
                          delay={generatedSet.numbers.length * 80}
                        />
                      </View>
                      <View style={styles.reasonList}>
                        {generatedSet.prediction.reasons.map((reason) => (
                          <Text key={`${generatedSet.id}-${reason}`} style={styles.reasonText}>
                            • {reason}
                          </Text>
                        ))}
                      </View>
                    </View>
                  );
                }
              }

              return null;
            })}
          </View>
          {isUser ? (
            <View style={styles.avatarUser}>
              <User size={16} color={Colors.background} />
            </View>
          ) : null}
        </View>
      );
    },
    [generatedSet, digitPicks]
  );

  if (!isPro && !canUseChat) {
    return (
      <AppBackground style={{ paddingTop: insets.top }}>
        <View style={styles.header}>
          <Sparkles size={20} color={Colors.gold} />
          <Text style={styles.headerTitle}>AI Chat</Text>
          <View style={styles.proBadgeHeader}>
            <Lock size={12} color={Colors.gold} />
            <Text style={styles.proBadgeHeaderText}>PRO</Text>
          </View>
        </View>
        <View style={styles.lockedContainer}>
          <View style={styles.lockedIconWrap}>
            <View style={styles.lockedIconInner}>
              <Brain size={48} color={Colors.gold} />
            </View>
            <View style={styles.lockedBadge}>
              <Crown size={14} color="#1A1200" />
            </View>
          </View>
          <Text style={styles.lockedTitle}>Free Trials Used Up</Text>
          <Text style={styles.lockedSubtitle}>
            You've used all 3 free AI Chat messages. Upgrade to Pro for unlimited access.
          </Text>
          <View style={styles.lockedFeatures}>
            {[
              'Unlimited AI-powered lottery advice',
              'Dream-to-number interpretation in chat',
              'Live trend analysis & model explanations',
              'Voice input & text-to-speech responses',
            ].map((feature) => (
              <View key={feature} style={styles.lockedFeatureRow}>
                <Sparkles size={14} color={Colors.gold} />
                <Text style={styles.lockedFeatureText}>{feature}</Text>
              </View>
            ))}
          </View>
          <GlossyButton
            onPress={() => router.push('/paywall')}
            label="Unlock Pro"
            icon={<Crown size={18} color="#FFFFFF" />}
            testID="chat-unlock-pro"
            variant="green"
            size="large"
          />
          <Animated.Text style={[styles.lockedPrice, { opacity: priceBlinkAnim }]}>$9.99/month · Cancel anytime</Animated.Text>
        </View>
      </AppBackground>
    );
  }

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <Sparkles size={20} color={Colors.gold} />
        <Text style={styles.headerTitle}>AI Chat</Text>
        {!isPro && (
          <View style={styles.freeUsesBadge}>
            <Text style={styles.freeUsesBadgeText}>{freeChatUsesLeft} free</Text>
          </View>
        )}
        <View style={styles.gameBadge}>
          <Text style={styles.gameBadgeText}>{config.shortName}</Text>
        </View>
      </View>

      <View style={styles.liveSummary}>
        <View style={styles.liveSummaryHeader}>
          <View style={styles.livePill}>
            <Radio size={14} color={Colors.gold} />
            <Text style={styles.livePillText}>{liveDraws.length} live draws</Text>
          </View>
          <View style={styles.livePill}>
            <Brain size={14} color={Colors.gold} />
            <Text style={styles.livePillText}>{stateName} engine</Text>
          </View>
          <View style={styles.livePill}>
            <Dice3 size={14} color="#2ECC71" />
            <Text style={styles.livePillText}>Pick 3/4</Text>
          </View>
        </View>
        <Text style={styles.liveSummaryText}>
          Latest {latestDraw ? `${latestDraw.numbers.join(', ')} + ${latestDraw.bonusNumber}` : 'draw unavailable'}
        </Text>
        <Text style={styles.liveSummaryText}>
          {pick3Summary} · {pick4Summary}
        </Text>
        <Text style={styles.liveSummaryText}>
          {stateGames.length} games available in {stateName}
        </Text>
      </View>

      <View style={styles.powerToolsStrip}>
        <TouchableOpacity style={styles.powerToolBtn} onPress={() => router.push('/store-locator')} activeOpacity={0.7} testID="chat-tool-store">
          <View style={[styles.powerToolIcon, { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderColor: 'rgba(212, 175, 55, 0.2)' }]}>
            <MapPin size={16} color={Colors.gold} />
          </View>
          <Text style={styles.powerToolLabel}>Stores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.powerToolBtn} onPress={() => router.push('/scanner')} activeOpacity={0.7} testID="chat-tool-scanner">
          <View style={[styles.powerToolIcon, { backgroundColor: 'rgba(0, 230, 118, 0.1)', borderColor: 'rgba(0, 230, 118, 0.2)' }]}>
            <ScanLine size={16} color="#00E676" />
          </View>
          <Text style={styles.powerToolLabel}>Scanner</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.powerToolBtn} onPress={() => router.push('/live-data')} activeOpacity={0.7} testID="chat-tool-live">
          <View style={[styles.powerToolIcon, { backgroundColor: 'rgba(255, 107, 53, 0.1)', borderColor: 'rgba(255, 107, 53, 0.2)' }]}>
            <Radio size={16} color="#FF6B35" />
          </View>
          <Text style={styles.powerToolLabel}>Live</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.powerToolBtn} onPress={() => router.push('/nationwide-analysis')} activeOpacity={0.7} testID="chat-tool-nationwide">
          <View style={[styles.powerToolIcon, { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderColor: 'rgba(212, 175, 55, 0.2)' }]}>
            <BarChart3 size={16} color={Colors.gold} />
          </View>
          <Text style={styles.powerToolLabel}>Analysis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.powerToolBtn} onPress={() => router.push('/shop')} activeOpacity={0.7} testID="chat-tool-shop">
          <View style={[styles.powerToolIcon, { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderColor: 'rgba(212, 175, 55, 0.2)' }]}>
            <ShoppingBag size={16} color={Colors.gold} />
          </View>
          <Text style={styles.powerToolLabel}>Shop</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Ask LottoMind™</Text>
            <Text style={styles.emptySubtitle}>
              Use live trends, explain the model, or generate fresh picks for {config.name}.
            </Text>
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionChip}
                  onPress={() => handleSend(suggestion)}
                  activeOpacity={0.8}
                  testID={`suggestion-${suggestion}`}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(message) => message.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask for lottery advice..."
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            testID="chat-input"
          />
          <VoiceRecordButton
            onTranscript={(text) => {
              setInput(text);
              setTimeout(() => handleSend(text), 100);
            }}
            size={42}
            color={Colors.gold}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim()}
            testID="chat-send"
          >
            <Send size={18} color={input.trim() ? '#1A1200' : Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.gold,
    flex: 1,
  },
  gameBadge: {
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  gameBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  liveSummary: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  liveSummaryHeader: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  livePillText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  liveSummaryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  suggestions: {
    marginTop: 16,
    gap: 8,
    width: '100%',
  },
  suggestionChip: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  avatarAI: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  avatarUser: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  userBubble: {
    backgroundColor: Colors.gold,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.surfaceLight,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  userText: {
    color: '#1A1200',
  },
  toolLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  toolText: {
    fontSize: 13,
    color: Colors.gold,
    fontStyle: 'italic' as const,
  },
  toolResult: {
    gap: 10,
    marginTop: 2,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  toolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  toolBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  toolMeta: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  toolBalls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  toolPlus: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  reasonList: {
    gap: 6,
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  textInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surfaceHighlight,
  },
  freeUsesBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  freeUsesBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#2ECC71',
  },
  digitPicksResult: {
    gap: 10,
    marginTop: 4,
  },
  digitPickRow: {
    flexDirection: 'row',
    gap: 8,
  },
  digitPickCard: {
    flex: 1,
    backgroundColor: 'rgba(46, 204, 113, 0.08)',
    borderRadius: 14,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.2)',
  },
  digitPickCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  digitPickCardTitle: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: '#2ECC71',
  },
  digitPickNumBox: {
    backgroundColor: 'rgba(46, 204, 113, 0.12)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.15)',
  },
  digitPickNumText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#2ECC71',
    letterSpacing: 3,
    fontVariant: ['tabular-nums'] as any,
  },
  digitPickNumBox4: {
    backgroundColor: 'rgba(52, 152, 219, 0.12)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.15)',
  },
  digitPickNumText4: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#3498DB',
    letterSpacing: 3,
    fontVariant: ['tabular-nums'] as any,
  },
  digitPickDisclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  speakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  proBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  proBadgeHeaderText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  lockedIconWrap: {
    position: 'relative' as const,
    marginBottom: 8,
  },
  lockedIconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.goldBorder,
  },
  lockedBadge: {
    position: 'absolute' as const,
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
  },
  lockedSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  lockedFeatures: {
    width: '100%',
    gap: 12,
    marginTop: 8,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lockedFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockedFeatureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    marginTop: 8,
  },
  unlockButtonText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  lockedPrice: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  powerToolsStrip: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  powerToolBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  powerToolIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  powerToolLabel: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textAlign: 'center' as const,
  },
  lottomindAiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: Colors.goldMuted,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  lottomindAiIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  lottomindAiInfo: {
    flex: 1,
    gap: 2,
  },
  lottomindAiTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  lottomindAiSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lottomindAiBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  lottomindAiBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
});
