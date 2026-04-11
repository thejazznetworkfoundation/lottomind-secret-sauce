import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Sparkles, Hash, Users, Clock, Star, Share2, Zap, HelpCircle, ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';

interface LetterBreakdown {
  letter: string;
  value: number;
}

interface NameResult {
  name: string;
  total: number;
  reduced: number;
  numbers: number[];
  meaning: string;
  bestDays: string[];
  element: string;
  aiInsight: string;
  letterBreakdown: LetterBreakdown[];
  nameMeaning: string;
}

const NUMEROLOGY_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const MEANINGS: Record<number, string> = {
  1: 'Leadership & independence. Numbers tied to bold, solo energy.',
  2: 'Partnership & balance. Your numbers carry harmonious vibrations.',
  3: 'Creativity & expression. Numbers aligned with artistic flow.',
  4: 'Stability & structure. Grounded numbers with strong foundations.',
  5: 'Adventure & change. Dynamic numbers with high volatility.',
  6: 'Nurturing & harmony. Numbers resonate with love and care.',
  7: 'Wisdom & intuition. Mystical numbers with deep insight.',
  8: 'Power & abundance. Numbers wired for wealth and success.',
  9: 'Compassion & completion. Universal numbers with full-cycle energy.',
};

const ELEMENTS: Record<number, string> = {
  1: 'Fire', 2: 'Water', 3: 'Air', 4: 'Earth', 5: 'Fire',
  6: 'Water', 7: 'Air', 8: 'Earth', 9: 'Fire',
};

const BEST_DAYS: Record<number, string[]> = {
  1: ['Sunday', 'Monday'], 2: ['Monday', 'Friday'], 3: ['Thursday', 'Wednesday'],
  4: ['Saturday', 'Sunday'], 5: ['Wednesday', 'Friday'], 6: ['Friday', 'Tuesday'],
  7: ['Monday', 'Sunday'], 8: ['Saturday', 'Thursday'], 9: ['Tuesday', 'Thursday'],
};

const NAME_MEANINGS: Record<string, string> = {
  michael: 'Hebrew origin — "Who is like God?" A name of divine strength and protection.',
  john: 'Hebrew origin — "God is gracious." Represents compassion and spiritual wisdom.',
  james: 'Hebrew origin — "Supplanter." Symbolizes determination and strategic thinking.',
  robert: 'Germanic origin — "Bright fame." Carries energy of recognition and leadership.',
  david: 'Hebrew origin — "Beloved." Resonates with love, loyalty, and artistic expression.',
  william: 'Germanic origin — "Resolute protector." A name of strength and guardianship.',
  mary: 'Hebrew origin — "Bitter" or "Beloved." Carries deep spiritual and nurturing energy.',
  sarah: 'Hebrew origin — "Princess." Symbolizes nobility, grace, and inner royalty.',
  jennifer: 'Welsh origin — "White wave." Flows with adaptability and creative power.',
  jessica: 'Hebrew origin — "God beholds." A name of divine vision and foresight.',
  daniel: 'Hebrew origin — "God is my judge." Represents justice, truth, and integrity.',
  matthew: 'Hebrew origin — "Gift of God." Carries blessings and generous spirit.',
  anthony: 'Latin origin — "Priceless one." Symbolizes rare value and inner worth.',
  mark: 'Latin origin — "Warlike." Brings energy of courage and bold action.',
  charles: 'Germanic origin — "Free man." Represents independence and liberty.',
  thomas: 'Aramaic origin — "Twin." Symbolizes duality, balance, and reflection.',
  christopher: 'Greek origin — "Bearer of Christ." Carries protective and guiding energy.',
  joseph: 'Hebrew origin — "He will add." Represents growth, abundance, and multiplication.',
  elizabeth: 'Hebrew origin — "God is my oath." Resonates with devotion and sacred promise.',
  patricia: 'Latin origin — "Noble one." Carries aristocratic energy and dignified presence.',
  linda: 'Spanish origin — "Beautiful." Symbolizes beauty, charm, and grace.',
  barbara: 'Greek origin — "Foreign" or "Stranger." Represents mystery and exotic energy.',
  susan: 'Hebrew origin — "Lily." Carries purity, elegance, and renewal.',
  margaret: 'Greek origin — "Pearl." Symbolizes wisdom born from experience.',
  nancy: 'Hebrew origin — "Grace." Flows with elegance and divine favor.',
  lisa: 'Hebrew origin — "Pledged to God." Represents spiritual dedication and focus.',
  karen: 'Danish origin — "Pure." Symbolizes clarity, honesty, and clean energy.',
  betty: 'Hebrew origin — "Pledged to God." Carries loyal and devoted vibrations.',
  ashley: 'English origin — "Ash tree meadow." Represents grounding and natural wisdom.',
  emily: 'Latin origin — "Rival" or "Industrious." Carries ambitious and driven energy.',
  anna: 'Hebrew origin — "Grace" or "Favor." Pure, balanced, and divinely favored.',
  alex: 'Greek origin — "Defender of the people." Symbolizes protection and courage.',
  chris: 'Greek origin — "Anointed." Carries spiritual blessing and purpose.',
  sam: 'Hebrew origin — "Heard by God." Represents divine connection and answered prayers.',
  jordan: 'Hebrew origin — "To flow down." Symbolizes fluidity, adaptability, and cleansing.',
  taylor: 'English origin — "Tailor." Represents craftsmanship and attention to detail.',
  morgan: 'Welsh origin — "Sea-born." Carries oceanic depth and mysterious energy.',
  casey: 'Irish origin — "Brave in battle." Symbolizes courage and warrior spirit.',
  kevin: 'Irish origin — "Gentle birth." Represents kindness with inner strength.',
  brian: 'Irish origin — "Noble" or "High." Carries elevated energy and honor.',
  jason: 'Greek origin — "Healer." Symbolizes restoration and transformative power.',
  steven: 'Greek origin — "Crown" or "Wreath." Represents victory and achievement.',
  paul: 'Latin origin — "Small" or "Humble." Carries quiet power and understated wisdom.',
  andrew: 'Greek origin — "Strong" or "Manly." Symbolizes fortitude and resilience.',
  joshua: 'Hebrew origin — "God is salvation." Represents divine rescue and purpose.',
  ryan: 'Irish origin — "Little king." Carries regal energy and natural authority.',
  brandon: 'English origin — "Beacon hill." Symbolizes guidance and illumination.',
  nicole: 'Greek origin — "Victory of the people." Represents triumph and communal power.',
  amber: 'Arabic origin — "Jewel." Carries warm, radiant, and precious energy.',
  crystal: 'Greek origin — "Ice" or "Clear." Symbolizes clarity, purity, and amplification.',
  diamond: 'Greek origin — "Unbreakable." Represents indestructible strength and brilliance.',
  destiny: 'Latin origin — "Fate." Carries predetermined purpose and cosmic alignment.',
  angel: 'Greek origin — "Messenger of God." Symbolizes divine communication and guidance.',
  grace: 'Latin origin — "Elegance" or "Blessing." Represents divine favor and beauty.',
  hope: 'English origin — "Expectation." Carries optimistic and faith-driven energy.',
  faith: 'English origin — "Trust" or "Belief." Symbolizes spiritual confidence and devotion.',
  joy: 'Latin origin — "Happiness." Radiates pure positive and uplifting energy.',
  victoria: 'Latin origin — "Victory." Represents triumph, success, and conquering spirit.',
  michelle: 'French origin — "Who is like God?" Carries divine feminine strength.',
  stephanie: 'Greek origin — "Crown" or "Garland." Symbolizes honor and accomplishment.',
  heather: 'English origin — "Flowering plant." Represents natural beauty and resilience.',
  rachel: 'Hebrew origin — "Ewe" or "Gentle." Carries nurturing and peaceful energy.',
  rebecca: 'Hebrew origin — "To bind." Symbolizes connection, unity, and faithful bonds.',
  laura: 'Latin origin — "Laurel." Represents victory, honor, and eternal achievement.',
  peter: 'Greek origin — "Rock." Symbolizes unshakable foundation and steadfastness.',
  george: 'Greek origin — "Farmer." Carries grounded, hardworking, and productive energy.',
  edward: 'English origin — "Wealthy guardian." Represents prosperity and protection.',
  henry: 'Germanic origin — "Ruler of the home." Symbolizes domestic power and authority.',
  richard: 'Germanic origin — "Brave ruler." Carries courageous leadership energy.',
  frank: 'Germanic origin — "Free one." Represents liberation and honest expression.',
  jack: 'English origin — "God is gracious." Symbolizes divine favor and adventurous spirit.',
  oscar: 'Irish origin — "Deer friend." Carries gentle strength and natural wisdom.',
  leo: 'Latin origin — "Lion." Represents fierce courage, royalty, and bold presence.',
  ruby: 'Latin origin — "Red gemstone." Symbolizes passion, vitality, and precious energy.',
  sophia: 'Greek origin — "Wisdom." Carries deep knowledge and enlightened understanding.',
  olivia: 'Latin origin — "Olive tree." Represents peace, fertility, and endurance.',
  emma: 'Germanic origin — "Whole" or "Universal." Symbolizes completeness and totality.',
  ava: 'Latin origin — "Bird-like." Carries free-spirited and soaring energy.',
  mia: 'Scandinavian origin — "Mine" or "Beloved." Represents cherished and precious bonds.',
  isabella: 'Hebrew origin — "Devoted to God." Carries deep spiritual commitment and beauty.',
  luna: 'Latin origin — "Moon." Symbolizes intuition, mystery, and cyclical energy.',
  chloe: 'Greek origin — "Blooming." Represents growth, fertility, and fresh beginnings.',
  aria: 'Italian origin — "Air" or "Song." Carries melodic, light, and harmonious energy.',
  noah: 'Hebrew origin — "Rest" or "Comfort." Symbolizes peace and new beginnings after storms.',
  liam: 'Irish origin — "Strong-willed warrior." Represents determination and fighting spirit.',
  ethan: 'Hebrew origin — "Strong" or "Firm." Carries solid, enduring, and reliable energy.',
  mason: 'English origin — "Stone worker." Symbolizes building, craftsmanship, and creation.',
  logan: 'Scottish origin — "Little hollow." Represents hidden depth and quiet strength.',
  lucas: 'Greek origin — "Light." Carries illuminating, bright, and guiding energy.',
  aiden: 'Irish origin — "Little fire." Symbolizes passion, spark, and youthful energy.',
  elijah: 'Hebrew origin — "My God is Yahweh." Represents divine power and prophetic insight.',
  oliver: 'Latin origin — "Olive tree." Carries peace, growth, and enduring prosperity.',
  benjamin: 'Hebrew origin — "Son of the right hand." Symbolizes favor and blessed strength.',
};

function getNameMeaning(name: string): string {
  const lower = name.toLowerCase().trim();
  const firstName = lower.split(' ')[0] ?? lower;
  if (NAME_MEANINGS[firstName]) return NAME_MEANINGS[firstName];
  const reduced = reduceNumber(calculateNameNumber(firstName));
  const vowels = firstName.replace(/[^aeiou]/g, '').length;
  const consonants = firstName.replace(/[^bcdfghjklmnpqrstvwxyz]/g, '').length;
  const balance = vowels >= consonants ? 'intuitive and expressive' : 'grounded and action-oriented';
  return `Your name vibrates at frequency ${reduced}. With ${vowels} vowel${vowels !== 1 ? 's' : ''} and ${consonants} consonant${consonants !== 1 ? 's' : ''}, your name is ${balance}. It carries ${ELEMENTS[reduced] ?? 'unique'} element energy.`;
}

function getLetterBreakdown(name: string): LetterBreakdown[] {
  return name
    .toLowerCase()
    .split('')
    .filter((char) => NUMEROLOGY_MAP[char] !== undefined)
    .map((char) => ({ letter: char.toUpperCase(), value: NUMEROLOGY_MAP[char] ?? 0 }));
}

const LETTER_DESCRIPTIONS: Record<number, string> = {
  1: 'Independence, ambition, leadership',
  2: 'Cooperation, sensitivity, diplomacy',
  3: 'Expression, creativity, joy',
  4: 'Stability, discipline, hard work',
  5: 'Freedom, adventure, change',
  6: 'Responsibility, love, nurturing',
  7: 'Spirituality, analysis, wisdom',
  8: 'Authority, power, material success',
  9: 'Compassion, humanitarianism, completion',
};

const AI_INSIGHTS: Record<number, string> = {
  1: 'Aligned for solo jackpot breakthroughs. Peak energy in prime-number draws.',
  2: 'Harmonious pairing detected. Best played with a partner or on even-numbered dates.',
  3: 'Creative frequency unlocked. Numbers resonate strongest during triple-digit draws.',
  4: 'Foundation numbers locked in. Stable patterns suggest consistent mid-range hits.',
  5: 'High-volatility signature. These numbers thrive in chaotic, high-jackpot cycles.',
  6: 'Balanced resonance field. Your numbers align with historically lucky sequences.',
  7: 'Mystical alignment detected. Rare jackpot cycle energy concentrated here.',
  8: 'Power frequency activated. Numbers wired for abundance and repeat patterns.',
  9: 'Universal completion energy. Full-cycle momentum suggests imminent convergence.',
};

function calculateNameNumber(name: string): number {
  return name
    .toLowerCase()
    .split('')
    .reduce((sum, char) => sum + (NUMEROLOGY_MAP[char] ?? 0), 0);
}

function reduceNumber(num: number): number {
  let n = num;
  while (n > 9) {
    n = String(n).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return n;
}

function generateLottoNumbers(total: number, reduced: number): number[] {
  const seed = total * 7 + reduced * 13;
  const numbers = new Set<number>();

  numbers.add(reduced);

  let val = seed;
  while (numbers.size < 5) {
    val = ((val * 31 + 17) % 69) + 1;
    numbers.add(val);
  }

  const bonusVal = ((total * 3 + reduced * 11) % 26) + 1;

  return [...Array.from(numbers), bonusVal];
}

function enhanceWithAI(reduced: number): string {
  return AI_INSIGHTS[reduced] ?? 'Unique frequency pattern detected. Play with confidence.';
}

function combineNames(name1: string, name2: string): NameResult {
  const combined = name1.trim() + name2.trim();
  const total = calculateNameNumber(combined);
  const reduced = reduceNumber(total);
  const numbers = generateLottoNumbers(total, reduced);
  return {
    name: `${name1.trim()} + ${name2.trim()}`,
    total,
    reduced,
    numbers,
    meaning: MEANINGS[reduced] ?? '',
    bestDays: BEST_DAYS[reduced] ?? [],
    element: ELEMENTS[reduced] ?? 'Unknown',
    aiInsight: enhanceWithAI(reduced),
    letterBreakdown: getLetterBreakdown(combined),
    nameMeaning: `Combined energy of ${name1.trim()} and ${name2.trim()} creates a unified vibration at frequency ${reduced}.`,
  };
}

function buildShareText(data: NameResult): string {
  const numbersStr = data.numbers.slice(0, -1).join(' \u2022 ');
  const bonus = data.numbers[data.numbers.length - 1];
  return [
    '\u{1F525} LOTTO MIND \u{1F525}',
    '',
    `Name: ${data.name}`,
    `Lucky Numbers:`,
    `${numbersStr} + ${bonus}`,
    '',
    `"${data.aiInsight}"`,
    '',
    `Life Path ${data.reduced} \u2022 ${data.element} Element`,
    `Best Days: ${data.bestDays.join(' & ')}`,
    '',
    '\u{1F449} Try yours now with LottoMind™',
  ].join('\n');
}

export default function NameNumberGenerator() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [result, setResult] = useState<NameResult | null>(null);
  const [comboResult, setComboResult] = useState<NameResult | null>(null);
  const [showCombiner, setShowCombiner] = useState<boolean>(false);
  const ballAnims = useRef<Animated.Value[]>(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const [helpExpanded, setHelpExpanded] = useState<boolean>(false);
  const helpBlinkAnim = useRef(new Animated.Value(1)).current;
  const btnBlinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(helpBlinkAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(helpBlinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [helpBlinkAnim]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(btnBlinkAnim, { toValue: 0.45, duration: 500, useNativeDriver: true }),
        Animated.timing(btnBlinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [btnBlinkAnim]);

  const toggleHelp = useCallback(() => {
    setHelpExpanded(prev => !prev);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  const animateBalls = useCallback(() => {
    ballAnims.forEach((a) => a.setValue(0));
    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    ballAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(i * 100),
        Animated.spring(anim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [ballAnims, fadeAnim]);

  const handleGenerate = useCallback(() => {
    if (!name.trim()) return;

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    const total = calculateNameNumber(name);
    const reduced = reduceNumber(total);
    const numbers = generateLottoNumbers(total, reduced);

    setResult({
      name: name.trim(),
      total,
      reduced,
      numbers,
      meaning: MEANINGS[reduced] ?? '',
      bestDays: BEST_DAYS[reduced] ?? [],
      element: ELEMENTS[reduced] ?? 'Unknown',
      aiInsight: enhanceWithAI(reduced),
      letterBreakdown: getLetterBreakdown(name),
      nameMeaning: getNameMeaning(name),
    });
    setComboResult(null);
    animateBalls();

    if (Platform.OS !== 'web') {
      setTimeout(() => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 500);
    }
  }, [name, buttonScale, animateBalls]);

  const handleCombine = useCallback(() => {
    if (!name.trim() || !partnerName.trim()) return;

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const combined = combineNames(name, partnerName);
    setComboResult(combined);
    animateBalls();
  }, [name, partnerName, animateBalls]);

  const handleShare = useCallback(async (data: NameResult) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const shareText = buildShareText(data);

    try {
      await Share.share({
        message: shareText,
        title: 'My Lucky Numbers - LottoMind™ AI',
      });
      console.log('[NameNumbers] Share successful');
    } catch (error) {
      console.log('[NameNumbers] Share error:', error);
      Alert.alert('Share Failed', 'Could not share your results. Please try again.');
    }
  }, []);

  const renderNumberBalls = (numbers: number[], isCombo?: boolean) => (
    <View style={styles.ballsContainer}>
      {numbers.map((num, idx) => {
        const isBonus = idx === numbers.length - 1;
        const scale = ballAnims[idx]?.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        }) ?? new Animated.Value(1);

        return (
          <Animated.View
            key={`${isCombo ? 'combo' : 'main'}-${idx}-${num}`}
            style={[
              styles.ball,
              isBonus && styles.bonusBall,
              { transform: [{ scale }] },
            ]}
          >
            <Text style={[styles.ballText, isBonus && styles.bonusBallText]}>
              {num}
            </Text>
            {isBonus && <Text style={styles.bonusLabel}>+</Text>}
          </Animated.View>
        );
      })}
    </View>
  );

  const renderResultCard = (data: NameResult, isCombo?: boolean) => (
    <Animated.View style={[styles.resultCard, { opacity: fadeAnim }]}>
      <View style={styles.resultHeader}>
        <View style={styles.resultTitleRow}>
          <Star size={16} color={Colors.gold} />
          <Text style={styles.resultTitle}>
            {isCombo ? 'Combined Energy' : 'Your Numbers'}
          </Text>
        </View>
        <View style={styles.reducedBadge}>
          <Text style={styles.reducedBadgeText}>Life Path {data.reduced}</Text>
        </View>
      </View>

      {renderNumberBalls(data.numbers, isCombo)}

      <View style={styles.letterBreakdownCard}>
        <Text style={styles.letterBreakdownTitle}>Letter-by-Letter Breakdown</Text>
        <View style={styles.letterGrid}>
          {data.letterBreakdown.map((item, idx) => (
            <View key={`letter-${idx}`} style={styles.letterItem}>
              <Text style={styles.letterChar}>{item.letter}</Text>
              <View style={styles.letterValueBadge}>
                <Text style={styles.letterValue}>{item.value}</Text>
              </View>
              <Text style={styles.letterTrait}>
                {LETTER_DESCRIPTIONS[item.value]?.split(',')[0] ?? ''}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.letterSumRow}>
          <Text style={styles.letterSumLabel}>Total:</Text>
          <Text style={styles.letterSumFormula}>
            {data.letterBreakdown.map((l) => l.value).join(' + ')} = {data.total}
          </Text>
          <Text style={styles.letterSumReduced}>
            → Life Path {data.reduced}
          </Text>
        </View>
      </View>

      <View style={styles.nameMeaningCard}>
        <View style={styles.nameMeaningHeader}>
          <Text style={styles.nameMeaningIcon}>📖</Text>
          <Text style={styles.nameMeaningTitle}>Name Meaning</Text>
        </View>
        <Text style={styles.nameMeaningText}>{data.nameMeaning}</Text>
      </View>

      <View style={styles.aiInsightCard}>
        <View style={styles.aiInsightHeader}>
          <Zap size={14} color={Colors.amber} />
          <Text style={styles.aiInsightTitle}>AI Insight</Text>
        </View>
        <Text style={styles.aiInsightText}>{data.aiInsight}</Text>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Numerology Insight</Text>
        <Text style={styles.insightText}>{data.meaning}</Text>
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Raw Total</Text>
          <Text style={styles.metaValue}>{data.total}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Element</Text>
          <Text style={styles.metaValue}>{data.element}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Best Days</Text>
          <Text style={styles.metaValue}>{data.bestDays.join(', ')}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.shareBtn}
        onPress={() => handleShare(data)}
        activeOpacity={0.8}
        testID={isCombo ? 'share-combo-btn' : 'share-result-btn'}
      >
        <Share2 size={16} color={Colors.gold} />
        <Text style={styles.shareBtnText}>Share My Numbers</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.headerBar}>
        <Animated.View style={{ opacity: helpBlinkAnim }}>
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={toggleHelp}
            activeOpacity={0.7}
            testID="name-numbers-help-btn"
          >
            <HelpCircle size={20} color={Colors.gold} />
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.headerCenter}>
          <Hash size={18} color={Colors.gold} />
          <Text style={styles.headerTitle}>Name Numbers</Text>
        </View>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          testID="back-btn"
        >
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {helpExpanded && (
            <View style={styles.helpDropdown}>
              <View style={styles.helpSection}>
                <View style={styles.helpSectionHeader}>
                  <Hash size={16} color={Colors.gold} />
                  <Text style={styles.helpSectionTitle}>How Name Numbers Works</Text>
                </View>
                <Text style={styles.helpText}>
                  The Name Number Generator uses ancient numerology to convert your name into lucky lottery numbers. Each letter corresponds to a number (A=1, B=2... I=9, J=1, etc.), following the Pythagorean numerology system.
                </Text>
                <Text style={styles.helpText}>
                  1. Enter your full name{"\n"}
                  2. Each letter is mapped to a number (1-9){"\n"}
                  3. All values are summed to get your raw total{"\n"}
                  4. The total is reduced to a single digit (Life Path){"\n"}
                  5. Lucky numbers are generated from your numerology signature
                </Text>
              </View>
              <View style={styles.helpDivider} />
              <View style={styles.helpSection}>
                <View style={styles.helpSectionHeader}>
                  <Users size={16} color={Colors.amber} />
                  <Text style={styles.helpSectionTitle}>Name Combiner</Text>
                </View>
                <Text style={styles.helpText}>
                  Combine two names (couples, parent + child, etc.) to find shared numerology energy. The combined vibration creates a unique set of lucky numbers that resonates with both names together.
                </Text>
              </View>
              <View style={styles.helpDivider} />
              <View style={styles.helpSection}>
                <View style={styles.helpSectionHeader}>
                  <Zap size={16} color={Colors.amber} />
                  <Text style={styles.helpSectionTitle}>AI Insights & Timing</Text>
                </View>
                <Text style={styles.helpText}>
                  Each Life Path number has unique attributes — element alignment (Fire, Water, Air, Earth), best play days, and AI-powered insights that suggest optimal timing and play strategies based on your numerology profile.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.heroSection}>
            <Text style={styles.heroEmoji}>🔢</Text>
            <Text style={styles.heroTitle}>Name Number Generator</Text>
            <Text style={styles.heroSub}>
              Transform your name into lucky lottery numbers using numerology
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name..."
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              testID="name-input"
            />
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }], opacity: name.trim() ? btnBlinkAnim : 1 }}>
            <TouchableOpacity
              style={[styles.generateBtn, !name.trim() && styles.generateBtnDisabled]}
              onPress={handleGenerate}
              activeOpacity={0.85}
              disabled={!name.trim()}
              testID="generate-btn"
            >
              <Sparkles size={20} color="#1A1200" />
              <Text style={styles.generateBtnText}>Generate Numbers</Text>
            </TouchableOpacity>
          </Animated.View>

          {result && renderResultCard(result)}

          <TouchableOpacity
            style={[styles.combinerToggle, showCombiner && styles.combinerToggleActive]}
            onPress={() => setShowCombiner(!showCombiner)}
            activeOpacity={0.7}
            testID="combiner-toggle"
          >
            <Users size={18} color={showCombiner ? Colors.gold : Colors.textMuted} />
            <Text style={[styles.combinerToggleText, showCombiner && styles.combinerToggleTextActive]}>
              Name Combiner (Couples / Kids)
            </Text>
          </TouchableOpacity>

          {showCombiner && (
            <View style={styles.combinerSection}>
              <Text style={styles.combinerHint}>
                Combine two names to find shared numerology energy
              </Text>
              <View style={styles.combinerInputs}>
                <TextInput
                  style={[styles.input, styles.comboInput]}
                  placeholder="First name..."
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  testID="combo-name1"
                />
                <Text style={styles.combinerPlus}>+</Text>
                <TextInput
                  style={[styles.input, styles.comboInput]}
                  placeholder="Second name..."
                  placeholderTextColor={Colors.textMuted}
                  value={partnerName}
                  onChangeText={setPartnerName}
                  autoCapitalize="words"
                  testID="combo-name2"
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.combineBtn,
                  (!name.trim() || !partnerName.trim()) && styles.combineBtnDisabled,
                ]}
                onPress={handleCombine}
                activeOpacity={0.85}
                disabled={!name.trim() || !partnerName.trim()}
                testID="combine-btn"
              >
                <Users size={18} color={Colors.background} />
                <Text style={styles.combineBtnText}>Combine & Generate</Text>
              </TouchableOpacity>

              {comboResult && renderResultCard(comboResult, true)}
            </View>
          )}

          <View style={styles.timingCard}>
            <View style={styles.timingHeader}>
              <Clock size={16} color={Colors.amber} />
              <Text style={styles.timingTitle}>Timing AI</Text>
            </View>
            <Text style={styles.timingText}>
              {result
                ? `Based on Life Path ${result.reduced}, your best draw days are ${result.bestDays.join(' & ')}. The ${result.element} element peaks during ${result.element === 'Fire' ? 'evening' : result.element === 'Water' ? 'morning' : result.element === 'Air' ? 'midday' : 'afternoon'} draws.`
                : 'Generate your name numbers to unlock personalized timing predictions.'}
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 18,
  },
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
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  helpBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  helpDropdown: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
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
    color: Colors.gold,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  helpDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  heroSection: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  heroEmoji: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.gold,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputSection: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  generateBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  generateBtnDisabled: {
    opacity: 0.4,
  },
  generateBtnText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  reducedBadge: {
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  reducedBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  ballsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  ball: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.goldMuted,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bonusBall: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderColor: Colors.red,
  },
  ballText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  bonusBallText: {
    color: Colors.red,
  },
  bonusLabel: {
    position: 'absolute',
    top: -6,
    right: -4,
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  insightCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metaItem: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.gold,
    textAlign: 'center',
  },
  combinerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  combinerToggleActive: {
    borderColor: Colors.goldBorder,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  combinerToggleText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  combinerToggleTextActive: {
    color: Colors.gold,
  },
  combinerSection: {
    gap: 12,
  },
  combinerHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  combinerInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comboInput: {
    flex: 1,
  },
  combinerPlus: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  combineBtn: {
    backgroundColor: Colors.amber,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  combineBtnDisabled: {
    opacity: 0.4,
  },
  combineBtnText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.background,
  },
  timingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)',
  },
  timingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timingTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.amber,
  },
  timingText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  aiInsightCard: {
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)',
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiInsightTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.amber,
  },
  aiInsightText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.champagne,
    fontStyle: 'italic' as const,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  letterBreakdownCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  letterBreakdownTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  letterItem: {
    alignItems: 'center',
    width: 58,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    gap: 3,
  },
  letterChar: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  letterValueBadge: {
    backgroundColor: Colors.goldMuted,
    borderRadius: 10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterValue: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  letterTrait: {
    fontSize: 8,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  letterSumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexWrap: 'wrap',
  },
  letterSumLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  letterSumFormula: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    flex: 1,
  },
  letterSumReduced: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  nameMeaningCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
  },
  nameMeaningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameMeaningIcon: {
    fontSize: 16,
  },
  nameMeaningTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.champagne,
  },
  nameMeaningText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
  },
});
