import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Activity, Layers, Zap, ChevronRight, TriangleAlert, Plus, Minus, Waves, ScanLine, Gauge, Sparkles, Check, Brain, HelpCircle, ChevronDown, Play } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import GlossyButton from '@/components/GlossyButton';
import { generateDreamSequence, DreamSequenceResult, EngineMode } from '@/utils/dreamSequence';
import SpeakButton from '@/components/SpeakButton';

const PRESET_SEQUENCES = [
  { label: 'Classic Rise', numbers: [12, 18, 47, 56, 63] },
  { label: 'Low Cluster', numbers: [3, 7, 14, 19, 25] },
  { label: 'High Spread', numbers: [34, 41, 55, 68, 72] },
  { label: 'Zigzag', numbers: [5, 28, 33, 59, 64] },
];

const PATTERN_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  micro: { label: 'Micro Growth', color: '#2ECC71', desc: 'Small consistent jumps detected' },
  macro: { label: 'Macro Leap', color: '#E67E22', desc: 'Large jumps between numbers' },
  mixed: { label: 'Mixed Rhythm', color: '#9B59B6', desc: 'Alternating small and large jumps' },
};

const ENGINE_OPTIONS: { id: EngineMode; label: string; color: string; icon: 'pattern' | 'rhythm' | 'dream'; desc: string }[] = [
  { id: 'pattern', label: 'Pattern Detection', color: '#2ECC71', icon: 'pattern', desc: 'Reads differences, detects micro vs macro jumps' },
  { id: 'rhythm', label: 'Rhythm Engine', color: '#E67E22', icon: 'rhythm', desc: 'Alternates growth & leap phases' },
  { id: 'dream', label: 'Dream Energy', color: '#9B59B6', icon: 'dream', desc: 'Applies modifier offset to sequences' },
];

function EngineIcon({ type, size, color }: { type: string; size: number; color: string }) {
  switch (type) {
    case 'pattern': return <ScanLine size={size} color={color} />;
    case 'rhythm': return <Gauge size={size} color={color} />;
    case 'dream': return <Sparkles size={size} color={color} />;
    default: return <Zap size={size} color={color} />;
  }
}

export default function SequenceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [inputText, setInputText] = useState<string>('');
  const [modifier, setModifier] = useState<number>(1);
  const [selectedEngines, setSelectedEngines] = useState<EngineMode[]>(['pattern', 'rhythm', 'dream']);
  const [result, setResult] = useState<DreamSequenceResult | null>(null);
  const [helpExpanded, setHelpExpanded] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollRef = useRef<ScrollView>(null);
  const helpBlinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(helpBlinkAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(helpBlinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => { loop.stop(); };
  }, [helpBlinkAnim]);

  const toggleHelp = useCallback(() => {
    setHelpExpanded(prev => !prev);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  const handleGenerate = useCallback(() => {
    const nums = inputText
      .split(/[,\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));

    if (nums.length < 2) return;

    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    const seq = generateDreamSequence(nums, modifier, selectedEngines);
    setResult(seq);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 350);
  }, [inputText, modifier, selectedEngines, fadeAnim, slideAnim]);

  const handlePreset = useCallback((nums: number[]) => {
    setInputText(nums.join(', '));
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  const adjustModifier = useCallback((delta: number) => {
    setModifier(prev => Math.max(-10, Math.min(10, prev + delta)));
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  const toggleEngine = useCallback((engine: EngineMode) => {
    setSelectedEngines(prev => {
      if (prev.includes(engine)) {
        if (prev.length === 1) return prev;
        return prev.filter(e => e !== engine);
      }
      return [...prev, engine];
    });
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  const selectAllEngines = useCallback(() => {
    setSelectedEngines(['pattern', 'rhythm', 'dream']);
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const allSelected = selectedEngines.length === 3;

  const patternInfo = result ? PATTERN_LABELS[result.patternType] : null;

  const summaryText = result
    ? `Pattern detected: ${patternInfo?.label}. ${patternInfo?.desc}. Base sequence: ${result.baseSequence.join(', ')}. Modified with +${result.modifier}: ${result.modifiedSequence.join(', ')}. Confidence: ${result.confidence}%.`
    : '';

  const canGenerate = inputText
    .split(/[,\s]+/)
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n)).length >= 2;

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Animated.View style={{ opacity: helpBlinkAnim }}>
              <TouchableOpacity
                style={styles.helpBtn}
                onPress={toggleHelp}
                activeOpacity={0.7}
                testID="sequence-help-btn"
              >
                <HelpCircle size={18} color="#E67E22" />
              </TouchableOpacity>
            </Animated.View>
            <Activity size={22} color="#E67E22" />
            <Text style={styles.title}>Sequence Engine℠</Text>
            <View style={styles.engineBadge}>
              <Text style={styles.engineBadgeText}>{selectedEngines.length === 3 ? '3-LAYER' : `${selectedEngines.length}-LAYER`}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {selectedEngines.length === 3
              ? 'Pattern detection + rhythm engine + dream energy'
              : selectedEngines.map(e => ENGINE_OPTIONS.find(o => o.id === e)?.label).filter(Boolean).join(' + ')}
          </Text>
        </View>

        {helpExpanded && (
          <View style={styles.helpDropdown}>
            <View style={styles.helpSection}>
              <View style={styles.helpSectionHeader}>
                <Activity size={16} color="#E67E22" />
                <Text style={styles.helpSectionTitle}>How Sequence Engine Works</Text>
              </View>
              <Text style={styles.helpText}>
                The Sequence Engine analyzes patterns in your seed numbers to predict the next numbers in the sequence. It detects whether numbers follow micro-growth (small jumps), macro-leap (large jumps), or mixed-rhythm patterns.
              </Text>
              <Text style={styles.helpText}>
                1. Enter at least 2 seed numbers{"\n"}
                2. Select which engines to use (Pattern, Rhythm, Dream){"\n"}
                3. The engine calculates differences between your numbers{"\n"}
                4. It extends the sequence based on detected patterns{"\n"}
                5. Results show base sequence + modified sequence
              </Text>
            </View>
            <View style={styles.helpDivider} />
            <View style={styles.helpSection}>
              <View style={styles.helpSectionHeader}>
                <Sparkles size={16} color="#9B59B6" />
                <Text style={styles.helpSectionTitle}>Dream Energy Modifier</Text>
              </View>
              <Text style={styles.helpText}>
                The Dream Energy Modifier adds a cosmic offset to your generated sequence. Positive values (+1 to +10) shift numbers upward for aggressive plays. Negative values (-1 to -10) pull numbers down for conservative picks.
              </Text>
              <Text style={styles.helpText}>
                This modifier is applied AFTER the base sequence is generated, creating a "modified sequence" that blends mathematical patterns with dream-inspired energy.
              </Text>
            </View>
            <View style={styles.helpDivider} />
            <View style={styles.helpSection}>
              <View style={styles.helpSectionHeader}>
                <Zap size={16} color="#2ECC71" />
                <Text style={styles.helpSectionTitle}>Engine Layers</Text>
              </View>
              <Text style={styles.helpText}>
                <Text style={{ fontWeight: '700' as const, color: '#2ECC71' }}>Pattern Detection</Text> - Reads differences between numbers and detects jump patterns{"\n"}
                <Text style={{ fontWeight: '700' as const, color: '#E67E22' }}>Rhythm Engine</Text> - Alternates between growth and leap phases{"\n"}
                <Text style={{ fontWeight: '700' as const, color: '#9B59B6' }}>Dream Energy</Text> - Applies the modifier offset for dream-inspired tweaks
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.lottomindCard}
          onPress={() => router.push('/lottomind-ai')}
          activeOpacity={0.85}
          testID="sequence-lottomind-ai"
        >
          <View style={styles.lottomindIcon}>
            <Sparkles size={20} color={Colors.gold} />
          </View>
          <View style={styles.lottomindInfo}>
            <Text style={styles.lottomindTitle}>LottoMind™</Text>
            <Text style={styles.lottomindSub}>AI number insights & smart sets</Text>
          </View>
          <View style={styles.lottomindBadge}>
            <Text style={styles.lottomindBadgeText}>OPEN</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.engineSelector}>
          <View style={styles.engineSelectorHeader}>
            <Text style={styles.engineSelectorTitle}>Select Engines</Text>
            <TouchableOpacity
              style={[styles.allBtn, allSelected && styles.allBtnActive]}
              onPress={selectAllEngines}
              activeOpacity={0.7}
              testID="select-all-engines"
            >
              {allSelected && <Check size={12} color="#1A1200" />}
              <Text style={[styles.allBtnText, allSelected && styles.allBtnTextActive]}>
                {allSelected ? 'All Active' : 'Use All'}
              </Text>
            </TouchableOpacity>
          </View>

          {ENGINE_OPTIONS.map((engine) => {
            const isActive = selectedEngines.includes(engine.id);
            return (
              <View key={engine.id}>
              <TouchableOpacity
                style={[
                  styles.engineCard,
                  isActive && { borderColor: engine.color, backgroundColor: `${engine.color}10` },
                ]}
                onPress={() => toggleEngine(engine.id)}
                activeOpacity={0.7}
                testID={`engine-toggle-${engine.id}`}
              >
                <View style={styles.engineCardLeft}>
                  <View style={[
                    styles.engineIconWrap,
                    { backgroundColor: isActive ? `${engine.color}20` : Colors.surfaceHighlight },
                  ]}>
                    <EngineIcon type={engine.icon} size={18} color={isActive ? engine.color : Colors.textMuted} />
                  </View>
                  <View style={styles.engineCardInfo}>
                    <Text style={[
                      styles.engineCardTitle,
                      isActive && { color: engine.color },
                    ]}>{engine.label}</Text>
                    <Text style={styles.engineCardDesc}>{engine.desc}</Text>
                  </View>
                </View>
                <View style={[
                  styles.engineToggle,
                  isActive && { backgroundColor: engine.color, borderColor: engine.color },
                ]}>
                  {isActive && <Check size={14} color="#0A0A0A" />}
                </View>
              </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Layers size={16} color="#E67E22" />
            <Text style={styles.inputLabel}>Seed Numbers</Text>
          </View>
          <TextInput
            style={styles.numberInput}
            placeholder="e.g. 12, 18, 47, 56, 63"
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            keyboardType="default"
            testID="sequence-input"
          />
          <Text style={styles.inputHint}>Enter at least 2 numbers separated by commas</Text>
        </View>

        <View style={styles.presetsSection}>
          <Text style={styles.presetsLabel}>Quick Presets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
            {PRESET_SEQUENCES.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={styles.presetChip}
                onPress={() => handlePreset(preset.numbers)}
                activeOpacity={0.7}
              >
                <Text style={styles.presetName}>{preset.label}</Text>
                <Text style={styles.presetNums}>{preset.numbers.join(', ')}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedEngines.includes('dream') && <View style={styles.modifierCard}>
          <View style={styles.modifierHeader}>
            <Waves size={16} color="#9B59B6" />
            <Text style={styles.modifierLabel}>Dream Energy Modifier</Text>
          </View>
          <View style={styles.modifierControls}>
            <TouchableOpacity
              style={styles.modBtn}
              onPress={() => adjustModifier(-1)}
              activeOpacity={0.7}
              testID="modifier-minus"
            >
              <Minus size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.modValueWrap}>
              <Text style={styles.modValue}>{modifier >= 0 ? `+${modifier}` : `${modifier}`}</Text>
            </View>
            <TouchableOpacity
              style={styles.modBtn}
              onPress={() => adjustModifier(1)}
              activeOpacity={0.7}
              testID="modifier-plus"
            >
              <Plus size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>}

        <GlossyButton
          onPress={handleGenerate}
          label={`Run ${selectedEngines.length === 3 ? 'All Engines' : selectedEngines.length === 1 ? '1 Engine' : `${selectedEngines.length} Engines`}`}
          icon={<Zap size={20} color="#FFFFFF" />}
          disabled={!canGenerate}
          testID="sequence-generate"
          variant="green"
          size="large"
          blink={canGenerate}
        />

        {result && (
          <Animated.View
            style={[
              styles.resultSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.patternCard}>
              <View style={styles.patternHeader}>
                <View style={[styles.patternIndicator, { backgroundColor: patternInfo?.color ?? Colors.gold }]} />
                <Text style={styles.patternTitle}>{patternInfo?.label ?? 'Unknown'}</Text>
                <View style={styles.confidencePill}>
                  <Text style={styles.confidenceText}>{result.confidence}%</Text>
                </View>
                <View style={styles.speakWrap}>
                  <SpeakButton text={summaryText} size={30} color="#E67E22" />
                </View>
              </View>
              <Text style={styles.patternDesc}>{patternInfo?.desc}</Text>

              <View style={styles.diffsRow}>
                <Text style={styles.diffsLabel}>Detected Jumps</Text>
                <View style={styles.diffsValues}>
                  {result.differences.map((d, i) => (
                    <View
                      key={`diff-${i}`}
                      style={[
                        styles.diffChip,
                        Math.abs(d) > 15 ? styles.diffChipLarge : styles.diffChipSmall,
                      ]}
                    >
                      <Text
                        style={[
                          styles.diffText,
                          Math.abs(d) > 15 ? styles.diffTextLarge : styles.diffTextSmall,
                        ]}
                      >
                        {d >= 0 ? `+${d}` : `${d}`}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.sequenceCard}>
              <Text style={styles.sequenceTitle}>Base Sequence</Text>
              <View style={styles.numsRow}>
                {result.inputNumbers.map((n, i) => (
                  <View key={`in-${i}`} style={styles.inputNumBall}>
                    <Text style={styles.inputNumText}>{n}</Text>
                  </View>
                ))}
                <ChevronRight size={18} color={Colors.textMuted} />
                {result.baseSequence.map((n, i) => (
                  <View key={`base-${i}`} style={styles.baseNumBall}>
                    <Text style={styles.baseNumText}>{n}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.modifiedCard}>
              <View style={styles.modifiedHeader}>
                <Text style={styles.modifiedTitle}>Modified Sequence</Text>
                <View style={styles.modifierPill}>
                  <Text style={styles.modifierPillText}>
                    {modifier >= 0 ? `+${modifier}` : `${modifier}`} energy
                  </Text>
                </View>
              </View>
              <View style={styles.numsRow}>
                {result.modifiedSequence.map((n, i) => (
                  <View key={`mod-${i}`} style={styles.modNumBall}>
                    <Text style={styles.modNumText}>{n}</Text>
                  </View>
                ))}
              </View>
            </View>

            {result.hotZone.length > 0 && (
              <View style={styles.hotZoneCard}>
                <View style={styles.hotZoneHeader}>
                  <Zap size={16} color={Colors.amber} />
                  <Text style={styles.hotZoneTitle}>Hot Zone Numbers</Text>
                </View>
                <View style={styles.hotZoneNums}>
                  {result.hotZone.map((n, i) => (
                    <View key={`hz-${i}`} style={styles.hotZoneBall}>
                      <Text style={styles.hotZoneNumText}>{n}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.hotZoneHint}>Most frequently appearing numbers across base & modified sequences</Text>
              </View>
            )}

            <View style={styles.disclaimerCard}>
              <TriangleAlert size={14} color={Colors.textMuted} />
              <Text style={styles.disclaimerText}>
                This feature is for entertainment purposes only. Lottery outcomes are random.
              </Text>
            </View>
          </Animated.View>
        )}

        <View style={styles.commercialCard}>
          <View style={styles.commercialHeader}>
            <Play size={14} color="#E67E22" />
            <Text style={styles.commercialTitle}>Featured Video</Text>
          </View>
          <TouchableOpacity
            style={styles.commercialVideoWrap}
            onPress={async () => {
              try {
                await WebBrowser.openBrowserAsync('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
                  presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                });
              } catch (e) {
                console.log('[Sequence] Failed to open video', e);
              }
            }}
            activeOpacity={0.8}
            testID="sequence-commercial-video"
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&q=80' }}
              style={styles.commercialThumbnail}
              resizeMode="cover"
            />
            <View style={styles.commercialPlayOverlay}>
              <View style={styles.commercialPlayCircle}>
                <Play size={22} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.commercialLabel}>
              <Text style={styles.commercialLabelText}>Watch: Sequence Strategy Tips</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 18,
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#E67E22',
    letterSpacing: -0.5,
  },
  engineBadge: {
    backgroundColor: 'rgba(230, 126, 34, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.3)',
  },
  engineBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#E67E22',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  engineSelector: {
    gap: 10,
  },
  engineSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  engineSelectorTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  allBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  allBtnActive: {
    backgroundColor: '#E67E22',
    borderColor: '#E67E22',
  },
  allBtnText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  allBtnTextActive: {
    color: '#1A1200',
  },
  engineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-between',
  },
  engineCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  engineIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  engineCardInfo: {
    flex: 1,
    gap: 2,
  },
  engineCardTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  engineCardDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 15,
  },
  engineToggle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  inputCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.2)',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#E67E22',
    flex: 1,
  },
  numberInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputHint: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  presetsSection: {
    gap: 10,
  },
  presetsLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  presetsRow: {
    gap: 10,
    paddingRight: 10,
  },
  presetChip: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 130,
  },
  presetName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  presetNums: {
    fontSize: 11,
    color: Colors.textMuted,
    fontVariant: ['tabular-nums'] as any,
  },
  modifierCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.2)',
  },
  modifierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modifierLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#9B59B6',
  },
  modifierControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  modBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modValueWrap: {
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155, 89, 182, 0.12)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.25)',
  },
  modValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#C4A6E8',
    fontVariant: ['tabular-nums'] as any,
  },
  generateBtn: {
    backgroundColor: '#E67E22',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#E67E22',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  generateBtnDisabled: {
    backgroundColor: Colors.surfaceHighlight,
    shadowOpacity: 0,
    elevation: 0,
  },
  generateText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  generateTextDisabled: {
    color: Colors.textMuted,
  },
  resultSection: {
    gap: 16,
  },
  patternCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.25)',
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  patternIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  patternTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  confidencePill: {
    backgroundColor: Colors.goldMuted,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  speakWrap: {
    marginLeft: 4,
  },
  patternDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  diffsRow: {
    gap: 8,
  },
  diffsLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  diffsValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diffChip: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  diffChipSmall: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderColor: 'rgba(46, 204, 113, 0.2)',
  },
  diffChipLarge: {
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    borderColor: 'rgba(230, 126, 34, 0.2)',
  },
  diffText: {
    fontSize: 14,
    fontWeight: '800' as const,
    fontVariant: ['tabular-nums'] as any,
  },
  diffTextSmall: {
    color: '#2ECC71',
  },
  diffTextLarge: {
    color: '#E67E22',
  },
  sequenceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sequenceTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  numsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  inputNumBall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputNumText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'] as any,
  },
  baseNumBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(230, 126, 34, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(230, 126, 34, 0.35)',
  },
  baseNumText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#E67E22',
    fontVariant: ['tabular-nums'] as any,
  },
  modifiedCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.2)',
  },
  modifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modifiedTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  modifierPill: {
    backgroundColor: 'rgba(155, 89, 182, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.25)',
  },
  modifierPillText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#C4A6E8',
  },
  modNumBall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(155, 89, 182, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(155, 89, 182, 0.35)',
  },
  modNumText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#C4A6E8',
    fontVariant: ['tabular-nums'] as any,
  },
  hotZoneCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  hotZoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hotZoneTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  hotZoneNums: {
    flexDirection: 'row',
    gap: 10,
  },
  hotZoneBall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
  },
  hotZoneNumText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.gold,
    fontVariant: ['tabular-nums'] as any,
  },
  hotZoneHint: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  intelligenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  intelligenceIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  intelligenceInfo: {
    flex: 1,
    gap: 3,
  },
  intelligenceTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#A78BFA',
  },
  intelligenceSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  commercialCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.2)',
    gap: 0,
  },
  commercialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  commercialTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#E67E22',
  },
  commercialVideoWrap: {
    position: 'relative' as const,
    height: 160,
    width: '100%',
  },
  commercialThumbnail: {
    width: '100%',
    height: '100%',
  },
  commercialPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commercialPlayCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(230, 126, 34, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  commercialLabel: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  commercialLabelText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#E67E22',
  },
  helpBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(230, 126, 34, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.3)',
  },
  helpDropdown: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(230, 126, 34, 0.2)',
  },
  helpSection: {
    gap: 8,
  },
  helpSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helpSectionTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  helpDivider: {
    height: 1,
    backgroundColor: 'rgba(230, 126, 34, 0.12)',
  },
  lottomindCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.goldMuted,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  lottomindIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  lottomindInfo: {
    flex: 1,
    gap: 2,
  },
  lottomindTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  lottomindSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lottomindBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  lottomindBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
});
