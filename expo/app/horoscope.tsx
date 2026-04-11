import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Star,
  Heart,
  Briefcase,
  Palette,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Globe,
  CloudSun,
  Hash,
  Baby,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { usePro } from '@/providers/ProProvider';
import { useGamification } from '@/providers/GamificationProvider';
import { Lock } from 'lucide-react-native';

const API_KEY = 's8R08YNuqjmpFClAHfu8ijoFgZNEyeqVtG0jctmi';

interface HoroscopeData {
  sign: string;
  date_range: string;
  current_date: string;
  description: string;
  compatibility: string;
  mood: string;
  color: string;
  lucky_number: string;
  lucky_time: string;
}

interface PlanetData {
  name: string;
  fullDegree: number;
  normDegree: number;
  speed: number;
  isRetro: string;
  sign: string;
  house: number;
}

const ZODIAC_SIGNS = [
  { id: 'aries', name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'fire' },
  { id: 'taurus', name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', element: 'earth' },
  { id: 'gemini', name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', element: 'air' },
  { id: 'cancer', name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'water' },
  { id: 'leo', name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'fire' },
  { id: 'virgo', name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'earth' },
  { id: 'libra', name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'air' },
  { id: 'scorpio', name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'water' },
  { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'fire' },
  { id: 'capricorn', name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'earth' },
  { id: 'aquarius', name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'air' },
  { id: 'pisces', name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'water' },
] as const;

type ElementType = 'fire' | 'earth' | 'air' | 'water';

const ELEMENT_COLORS: Record<ElementType, string> = {
  fire: '#FF6B35',
  earth: '#8B6914',
  air: '#7EC8E3',
  water: '#3498DB',
};

const ELEMENT_ICONS: Record<ElementType, React.ReactNode> = {
  fire: <Flame size={14} color="#FF6B35" />,
  earth: <Mountain size={14} color="#8B6914" />,
  air: <Wind size={14} color="#7EC8E3" />,
  water: <Droplets size={14} color="#3498DB" />,
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#FFD700',
  Moon: '#C0C0C0',
  Mercury: '#7EC8E3',
  Venus: '#FF69B4',
  Mars: '#FF4500',
  Jupiter: '#DAA520',
  Saturn: '#8B7355',
  Uranus: '#00CED1',
  Neptune: '#4169E1',
  Pluto: '#9B59B6',
};

const FALLBACK_HOROSCOPES: Record<string, HoroscopeData> = {
  aries: { sign: 'Aries', date_range: 'Mar 21 - Apr 19', current_date: new Date().toLocaleDateString(), description: 'Today brings bold energy your way. Trust your instincts and take the lead in any situation. A surprise financial opportunity may present itself — stay alert!', compatibility: 'Leo', mood: 'Energetic', color: 'Red', lucky_number: '7, 14, 21', lucky_time: '2:00 PM' },
  taurus: { sign: 'Taurus', date_range: 'Apr 20 - May 20', current_date: new Date().toLocaleDateString(), description: 'Patience pays off today. Financial matters look promising and a stable foundation is being built. Keep your eye on long-term goals and avoid impulsive decisions.', compatibility: 'Virgo', mood: 'Determined', color: 'Green', lucky_number: '4, 16, 33', lucky_time: '6:00 PM' },
  gemini: { sign: 'Gemini', date_range: 'May 21 - Jun 20', current_date: new Date().toLocaleDateString(), description: 'Communication is your superpower today. Share your ideas freely and connections will strengthen. A message or number that catches your eye could be significant.', compatibility: 'Aquarius', mood: 'Curious', color: 'Yellow', lucky_number: '5, 11, 27', lucky_time: '10:00 AM' },
  cancer: { sign: 'Cancer', date_range: 'Jun 21 - Jul 22', current_date: new Date().toLocaleDateString(), description: 'Your intuition is heightened today. Trust those gut feelings, especially around numbers and timing. Home and family bring comfort and lucky vibes.', compatibility: 'Scorpio', mood: 'Intuitive', color: 'Silver', lucky_number: '2, 18, 42', lucky_time: '8:00 PM' },
  leo: { sign: 'Leo', date_range: 'Jul 23 - Aug 22', current_date: new Date().toLocaleDateString(), description: 'The spotlight is on you today! Your confidence attracts positive energy and fortune. Bold plays and big dreams are favored — go all in on what excites you.', compatibility: 'Sagittarius', mood: 'Confident', color: 'Gold', lucky_number: '1, 19, 37', lucky_time: '1:00 PM' },
  virgo: { sign: 'Virgo', date_range: 'Aug 23 - Sep 22', current_date: new Date().toLocaleDateString(), description: 'Details matter today. Your analytical mind spots patterns others miss. Apply this precision to your number picks — methodical approaches are favored.', compatibility: 'Capricorn', mood: 'Analytical', color: 'Navy', lucky_number: '6, 22, 44', lucky_time: '4:00 PM' },
  libra: { sign: 'Libra', date_range: 'Sep 23 - Oct 22', current_date: new Date().toLocaleDateString(), description: 'Balance and harmony guide your day. Partnerships and collaborations bring luck. Consider pooling resources with someone you trust for better odds.', compatibility: 'Gemini', mood: 'Harmonious', color: 'Pink', lucky_number: '3, 15, 39', lucky_time: '7:00 PM' },
  scorpio: { sign: 'Scorpio', date_range: 'Oct 23 - Nov 21', current_date: new Date().toLocaleDateString(), description: 'Transformation energy is strong. Hidden opportunities reveal themselves to those who look deeper. Your instincts about timing and numbers are razor-sharp today.', compatibility: 'Pisces', mood: 'Intense', color: 'Black', lucky_number: '8, 24, 48', lucky_time: '11:00 PM' },
  sagittarius: { sign: 'Sagittarius', date_range: 'Nov 22 - Dec 21', current_date: new Date().toLocaleDateString(), description: 'Adventure and expansion mark your day. Think big and aim high — fortune favors the bold. Travel or new experiences could trigger lucky encounters.', compatibility: 'Aries', mood: 'Optimistic', color: 'Purple', lucky_number: '9, 27, 45', lucky_time: '3:00 PM' },
  capricorn: { sign: 'Capricorn', date_range: 'Dec 22 - Jan 19', current_date: new Date().toLocaleDateString(), description: 'Discipline and structure serve you well today. Your long-term strategy is paying dividends. Stay focused on proven methods and steady accumulation.', compatibility: 'Taurus', mood: 'Focused', color: 'Brown', lucky_number: '10, 28, 50', lucky_time: '9:00 AM' },
  aquarius: { sign: 'Aquarius', date_range: 'Jan 20 - Feb 18', current_date: new Date().toLocaleDateString(), description: 'Unconventional thinking leads to breakthroughs today. Follow the road less traveled with your picks. Innovation and originality are your lucky charms.', compatibility: 'Libra', mood: 'Creative', color: 'Electric Blue', lucky_number: '11, 29, 47', lucky_time: '5:00 PM' },
  pisces: { sign: 'Pisces', date_range: 'Feb 19 - Mar 20', current_date: new Date().toLocaleDateString(), description: 'Dreams and intuition are powerfully aligned today. Pay attention to recurring numbers in your subconscious. Water-related symbols carry special significance.', compatibility: 'Cancer', mood: 'Dreamy', color: 'Sea Green', lucky_number: '12, 21, 36', lucky_time: '12:00 PM' },
};

async function fetchHoroscope(sign: string): Promise<HoroscopeData> {
  console.log('[Horoscope] Fetching horoscope for:', sign);
  try {
    const response = await fetch(
      `https://api.api-ninjas.com/v1/horoscope?sign=${sign}`,
      {
        headers: {
          'X-Api-Key': API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.log('[Horoscope] API error:', response.status, '- using fallback');
      return FALLBACK_HOROSCOPES[sign] ?? FALLBACK_HOROSCOPES['aries'];
    }

    const data = await response.json();
    console.log('[Horoscope] Received data:', data);

    if (!data || (!data.description && !data.horoscope)) {
      console.log('[Horoscope] Invalid data format, using fallback');
      return FALLBACK_HOROSCOPES[sign] ?? FALLBACK_HOROSCOPES['aries'];
    }

    const normalizedData: HoroscopeData = {
      sign: data.sign ?? sign,
      date_range: data.date_range ?? '',
      current_date: data.current_date ?? new Date().toLocaleDateString(),
      description: data.description ?? data.horoscope ?? 'Check back later for your reading.',
      compatibility: data.compatibility ?? FALLBACK_HOROSCOPES[sign]?.compatibility ?? 'N/A',
      mood: data.mood ?? FALLBACK_HOROSCOPES[sign]?.mood ?? 'Neutral',
      color: data.color ?? FALLBACK_HOROSCOPES[sign]?.color ?? 'Gold',
      lucky_number: data.lucky_number ?? FALLBACK_HOROSCOPES[sign]?.lucky_number ?? String(Math.floor(Math.random() * 69) + 1),
      lucky_time: data.lucky_time ?? FALLBACK_HOROSCOPES[sign]?.lucky_time ?? '12:00 PM',
    };

    return normalizedData;
  } catch (error) {
    console.log('[Horoscope] Fetch error:', error, '- using fallback');
    return FALLBACK_HOROSCOPES[sign] ?? FALLBACK_HOROSCOPES['aries'];
  }
}

function generateStaticPlanetPositions(): PlanetData[] {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const baseSeed = dayOfYear + now.getFullYear();

  const ZODIAC_SIGNS_LIST = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  const planetDefs = [
    { name: 'Sun', baseDeg: (dayOfYear * 0.9856) % 360, speed: 0.9856 },
    { name: 'Moon', baseDeg: (dayOfYear * 13.176) % 360, speed: 13.176 },
    { name: 'Mercury', baseDeg: ((baseSeed * 7 + 45) % 360), speed: 1.383 },
    { name: 'Venus', baseDeg: ((baseSeed * 5 + 120) % 360), speed: 1.2 },
    { name: 'Mars', baseDeg: ((baseSeed * 3 + 200) % 360), speed: 0.524 },
    { name: 'Jupiter', baseDeg: ((baseSeed * 0.5 + 80) % 360), speed: 0.083 },
    { name: 'Saturn', baseDeg: ((baseSeed * 0.3 + 300) % 360), speed: 0.034 },
    { name: 'Uranus', baseDeg: ((baseSeed * 0.1 + 50) % 360), speed: 0.012 },
    { name: 'Neptune', baseDeg: ((baseSeed * 0.07 + 355) % 360), speed: 0.006 },
    { name: 'Pluto', baseDeg: ((baseSeed * 0.04 + 298) % 360), speed: 0.004 },
  ];

  return planetDefs.map((p) => {
    const fullDeg = p.baseDeg;
    const signIndex = Math.floor(fullDeg / 30) % 12;
    const normDeg = fullDeg % 30;
    const house = (Math.floor(fullDeg / 30) % 12) + 1;
    const isRetro = (p.name === 'Mercury' && dayOfYear % 88 < 21) ||
      (p.name === 'Saturn' && dayOfYear % 378 < 138) ||
      (p.name === 'Jupiter' && dayOfYear % 399 < 121);
    return {
      name: p.name,
      fullDegree: Math.round(fullDeg * 100) / 100,
      normDegree: Math.round(normDeg * 100) / 100,
      speed: p.speed,
      isRetro: isRetro ? 'true' : 'false',
      sign: ZODIAC_SIGNS_LIST[signIndex] ?? 'Aries',
      house,
    };
  });
}

async function fetchPlanetsExtended(): Promise<PlanetData[]> {
  console.log('[Horoscope] Fetching extended planetary positions');
  try {
    const response = await fetch('https://json.freeastrologyapi.com/planets/extended', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'G4ItGgTroi98RIbSqVFVm4uHs4pPT3rgacEGKerw',
      },
    });

    if (!response.ok) {
      console.log('[Horoscope] Extended planets API error:', response.status, '- using static data');
      return generateStaticPlanetPositions();
    }

    const data = await response.json();
    console.log('[Horoscope] Extended planets data:', JSON.stringify(data).slice(0, 300));
    const parsed = parsePlanetData(data);
    if (parsed.length === 0) {
      console.log('[Horoscope] Parsed empty, using static data');
      return generateStaticPlanetPositions();
    }
    return parsed;
  } catch (error) {
    console.log('[Horoscope] Extended planets fetch error:', error);
    return generateStaticPlanetPositions();
  }
}

async function fetchPlanetsFallback(): Promise<PlanetData[]> {
  console.log('[Horoscope] Fetching planetary positions (fallback)');
  try {
    const response = await fetch('https://json.freeastrologyapi.com/western/planets', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('[Horoscope] Planets fallback API error:', response.status);
      return generateStaticPlanetPositions();
    }

    const data = await response.json();
    console.log('[Horoscope] Planets fallback data:', JSON.stringify(data).slice(0, 200));
    const parsed = parsePlanetData(data);
    if (parsed.length === 0) return generateStaticPlanetPositions();
    return parsed;
  } catch (error) {
    console.log('[Horoscope] Planets fallback error:', error);
    return generateStaticPlanetPositions();
  }
}

function parsePlanetData(data: unknown): PlanetData[] {
  if (Array.isArray(data)) {
    return data.map((p: Record<string, unknown>) => ({
      name: String(p.name ?? p.Name ?? ''),
      fullDegree: Number(p.fullDegree ?? p.FullDegree ?? p.full_degree ?? 0),
      normDegree: Number(p.normDegree ?? p.NormDegree ?? p.norm_degree ?? 0),
      speed: Number(p.speed ?? p.Speed ?? 0),
      isRetro: String(p.isRetro ?? p.IsRetro ?? p.is_retro ?? 'false'),
      sign: String(p.sign ?? p.Sign ?? ''),
      house: Number(p.house ?? p.House ?? 0),
    }));
  }

  if (data && typeof data === 'object') {
    const planets: PlanetData[] = [];
    const keys = Object.keys(data as Record<string, unknown>);
    for (const key of keys) {
      const val = (data as Record<string, unknown>)[key];
      if (val && typeof val === 'object') {
        const obj = val as Record<string, unknown>;
        planets.push({
          name: String(obj.name ?? obj.Name ?? key),
          fullDegree: Number(obj.fullDegree ?? obj.FullDegree ?? obj.full_degree ?? 0),
          normDegree: Number(obj.normDegree ?? obj.NormDegree ?? obj.norm_degree ?? 0),
          speed: Number(obj.speed ?? obj.Speed ?? 0),
          isRetro: String(obj.isRetro ?? obj.IsRetro ?? obj.is_retro ?? 'false'),
          sign: String(obj.sign ?? obj.Sign ?? ''),
          house: Number(obj.house ?? obj.House ?? 0),
        });
      }
    }
    return planets;
  }

  return [];
}

export default function HoroscopeScreen() {
  console.log('[HoroscopeScreen] rendered');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPro, canUseHoroscope, freeHoroscopeUsesLeft, useHoroscopeUse, canUseBabyNames, freeBabyNamesUsesLeft, useBabyNamesUse, canUseWeather, freeWeatherUsesLeft, useWeatherUse } = usePro();
  const { credits, spendCredits } = useGamification();
  const [selectedSign, setSelectedSign] = useState<string>('aries');
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [showPlanets, setShowPlanets] = useState<boolean>(true);
  const [hasUsedFreeToday, setHasUsedFreeToday] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const currentZodiac = ZODIAC_SIGNS.find((z) => z.id === selectedSign)!;

  const horoscopeAccessible = isPro || isUnlocked || canUseHoroscope;

  const handleUnlockWithFree = useCallback(() => {
    if (isPro) {
      setIsUnlocked(true);
      return;
    }
    if (canUseHoroscope) {
      const used = useHoroscopeUse();
      if (used) {
        setIsUnlocked(true);
        setHasUsedFreeToday(true);
        console.log('[Horoscope] Free daily use consumed');
      }
    }
  }, [isPro, canUseHoroscope, useHoroscopeUse]);

  const handleUnlockWithCredits = useCallback(() => {
    const HOROSCOPE_CREDIT_COST = 100;
    if (credits >= HOROSCOPE_CREDIT_COST) {
      const spent = spendCredits(HOROSCOPE_CREDIT_COST);
      if (spent) {
        setIsUnlocked(true);
        console.log('[Horoscope] Unlocked with 100 credits');
        if (Platform.OS !== 'web') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } else {
      Alert.alert(
        'Not Enough Credits',
        `You need ${HOROSCOPE_CREDIT_COST} credits to unlock. You have ${credits}. Play games to earn more!`,
        [
          { text: 'Play Games', onPress: () => router.push('/trivia-rewards' as never) },
          { text: 'OK' },
        ]
      );
    }
  }, [credits, spendCredits, router]);

  React.useEffect(() => {
    if (isPro) {
      setIsUnlocked(true);
    }
  }, [isPro]);

  const { data: horoscope, isLoading, error, refetch } = useQuery<HoroscopeData>({
    queryKey: ['horoscope', selectedSign],
    queryFn: () => fetchHoroscope(selectedSign),
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });

  const { data: planets, isLoading: isPlanetsLoading } = useQuery<PlanetData[]>({
    queryKey: ['planets-extended'],
    queryFn: fetchPlanetsExtended,
    staleTime: 1000 * 60 * 60,
    retry: 1,
    placeholderData: generateStaticPlanetPositions(),
  });

  const handleSelectSign = useCallback(
    (signId: string) => {
      setSelectedSign(signId);
      setShowPicker(false);
      if (Platform.OS !== 'web') {
        void Haptics.selectionAsync();
      }
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    },
    [fadeAnim, slideAnim]
  );

  React.useEffect(() => {
    if (horoscope) {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [horoscope, fadeAnim, slideAnim]);

  const filteredPlanets = (planets ?? []).filter(p => p.name && p.name.length > 0);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Sun size={18} color={Colors.gold} />
          <Text style={styles.headerTitle}>Daily Horoscope</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {!isUnlocked && !isPro && (
        <View style={styles.gateOverlay}>
          <View style={styles.gateCard}>
            <Sun size={48} color={Colors.gold} />
            <Text style={styles.gateTitle}>Daily Horoscope</Text>
            <Text style={styles.gateSub}>
              {canUseHoroscope
                ? `You have ${freeHoroscopeUsesLeft} free reading${freeHoroscopeUsesLeft !== 1 ? 's' : ''} today`
                : 'Your free daily reading has been used'}
            </Text>

            {canUseHoroscope ? (
              <TouchableOpacity
                style={styles.gateFreeBtn}
                onPress={handleUnlockWithFree}
                activeOpacity={0.85}
                testID="horoscope-free-unlock"
              >
                <Sparkles size={18} color="#1A1200" />
                <Text style={styles.gateFreeBtnText}>Use Free Daily Reading</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.gateCreditBtn}
                  onPress={handleUnlockWithCredits}
                  activeOpacity={0.85}
                  testID="horoscope-credit-unlock"
                >
                  <Text style={styles.gateCreditBtnText}>Unlock with 100 Credits</Text>
                  <View style={styles.gateCreditBadge}>
                    <Text style={styles.gateCreditBadgeText}>{credits} available</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.gateEarnBtn}
                  onPress={() => router.push('/trivia-rewards' as never)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.gateEarnBtnText}>Play Games & Earn Credits</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        pointerEvents={isUnlocked || isPro ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={styles.signSelector}
          onPress={() => {
            setShowPicker(!showPicker);
            if (Platform.OS !== 'web') {
              void Haptics.selectionAsync();
            }
          }}
          activeOpacity={0.8}
          testID="sign-selector"
        >
          <View style={styles.signSelectorLeft}>
            <Text style={styles.signSymbol}>{currentZodiac.symbol}</Text>
            <View>
              <Text style={styles.signName}>{currentZodiac.name}</Text>
              <Text style={styles.signDates}>{currentZodiac.dates}</Text>
            </View>
          </View>
          <View style={styles.signSelectorRight}>
            <View style={[styles.elementBadge, { backgroundColor: `${ELEMENT_COLORS[currentZodiac.element]}18` }]}>
              {ELEMENT_ICONS[currentZodiac.element]}
              <Text style={[styles.elementText, { color: ELEMENT_COLORS[currentZodiac.element] }]}>
                {currentZodiac.element.charAt(0).toUpperCase() + currentZodiac.element.slice(1)}
              </Text>
            </View>
            <ChevronDown size={18} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>

        {showPicker && (
          <View style={styles.pickerGrid}>
            {ZODIAC_SIGNS.map((sign) => {
              const isSelected = sign.id === selectedSign;
              const elemColor = ELEMENT_COLORS[sign.element];
              return (
                <TouchableOpacity
                  key={sign.id}
                  style={[
                    styles.pickerItem,
                    isSelected && { borderColor: Colors.gold, backgroundColor: Colors.goldMuted },
                  ]}
                  onPress={() => handleSelectSign(sign.id)}
                  activeOpacity={0.7}
                  testID={`sign-${sign.id}`}
                >
                  <Text style={styles.pickerSymbol}>{sign.symbol}</Text>
                  <Text style={[styles.pickerName, isSelected && { color: Colors.gold }]}>{sign.name}</Text>
                  <View style={[styles.pickerElementDot, { backgroundColor: elemColor }]} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.gold} />
            <Text style={styles.loadingText}>Reading the stars...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load horoscope</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.7}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {horoscope && !isLoading && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: 16 }}>
            <View style={styles.mainCard}>
              <View style={styles.mainCardHeader}>
                <View style={styles.mainCardIcon}>
                  <Moon size={20} color={Colors.gold} />
                </View>
                <View>
                  <Text style={styles.mainCardTitle}>Today's Reading</Text>
                  <Text style={styles.mainCardDate}>{horoscope.current_date}</Text>
                </View>
              </View>
              <Text style={styles.horoscopeDescription}>{horoscope.description}</Text>
            </View>

            <View style={styles.insightsGrid}>
              <View style={styles.insightCard}>
                <View style={[styles.insightIconWrap, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
                  <Heart size={18} color="#E74C3C" />
                </View>
                <Text style={styles.insightLabel}>Compatibility</Text>
                <Text style={styles.insightValue}>{horoscope.compatibility}</Text>
              </View>

              <View style={styles.insightCard}>
                <View style={[styles.insightIconWrap, { backgroundColor: 'rgba(155, 89, 182, 0.1)' }]}>
                  <Sparkles size={18} color="#9B59B6" />
                </View>
                <Text style={styles.insightLabel}>Mood</Text>
                <Text style={styles.insightValue}>{horoscope.mood}</Text>
              </View>

              <View style={styles.insightCard}>
                <View style={[styles.insightIconWrap, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                  <Palette size={18} color="#2ECC71" />
                </View>
                <Text style={styles.insightLabel}>Lucky Color</Text>
                <Text style={styles.insightValue}>{horoscope.color}</Text>
              </View>

              <View style={styles.insightCard}>
                <View style={[styles.insightIconWrap, { backgroundColor: Colors.goldMuted }]}>
                  <Star size={18} color={Colors.gold} />
                </View>
                <Text style={styles.insightLabel}>Lucky Number</Text>
                <Text style={[styles.insightValue, styles.luckyNumber]}>{horoscope.lucky_number}</Text>
              </View>
            </View>

            <View style={styles.luckyTimeCard}>
              <View style={styles.luckyTimeLeft}>
                <Briefcase size={18} color={Colors.gold} />
                <View>
                  <Text style={styles.luckyTimeLabel}>Lucky Time</Text>
                  <Text style={styles.luckyTimeValue}>{horoscope.lucky_time}</Text>
                </View>
              </View>
              <View style={styles.luckyTimeBadge}>
                <Text style={styles.luckyTimeBadgeText}>Play Window</Text>
              </View>
            </View>

            <View style={styles.planetaryCard}>
              <TouchableOpacity
                style={styles.planetaryHeader}
                onPress={() => {
                  setShowPlanets(!showPlanets);
                  if (Platform.OS !== 'web') {
                    void Haptics.selectionAsync();
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.planetaryHeaderLeft}>
                  <Globe size={18} color="#00CED1" />
                  <Text style={styles.planetaryTitle}>Planetary Positions</Text>
                </View>
                {isPlanetsLoading ? (
                  <ActivityIndicator size="small" color="#00CED1" />
                ) : (
                  <ChevronDown
                    size={16}
                    color={Colors.textMuted}
                    style={{ transform: [{ rotate: showPlanets ? '180deg' : '0deg' }] }}
                  />
                )}
              </TouchableOpacity>

              {showPlanets && filteredPlanets.length > 0 && (
                <View style={styles.planetsGrid}>
                  {filteredPlanets.map((planet) => {
                    const symbol = PLANET_SYMBOLS[planet.name] ?? '●';
                    const color = PLANET_COLORS[planet.name] ?? Colors.gold;
                    const isRetro = planet.isRetro === 'true' || planet.isRetro === 'True';
                    return (
                      <View key={planet.name} style={styles.planetItem}>
                        <View style={[styles.planetSymbolWrap, { borderColor: `${color}40` }]}>
                          <Text style={[styles.planetSymbolText, { color }]}>{symbol}</Text>
                        </View>
                        <View style={styles.planetInfo}>
                          <View style={styles.planetNameRow}>
                            <Text style={styles.planetName}>{planet.name}</Text>
                            {isRetro && (
                              <View style={styles.retroBadge}>
                                <Text style={styles.retroText}>R</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.planetSign}>{planet.sign || 'Unknown'}</Text>
                          <Text style={styles.planetDegree}>{planet.normDegree.toFixed(1)}°</Text>
                        </View>
                        {planet.house > 0 && (
                          <View style={styles.planetHouse}>
                            <Text style={styles.planetHouseLabel}>House</Text>
                            <Text style={styles.planetHouseNum}>{planet.house}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {showPlanets && filteredPlanets.length === 0 && !isPlanetsLoading && (
                <Text style={styles.planetsEmpty}>Planetary data unavailable</Text>
              )}
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Lottery Tip</Text>
              <Text style={styles.tipText}>
                Your lucky number today is {horoscope.lucky_number}. Consider incorporating it into your picks.
                {horoscope.mood === 'Happy' || horoscope.mood === 'Optimistic'
                  ? ' Your positive energy suggests bold plays today!'
                  : ' Trust your instincts and play with patience.'}
              </Text>
            </View>
          </Animated.View>
        )}

        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => {
            if (isPro || canUseWeather) {
              if (!isPro && canUseWeather) {
                useWeatherUse();
              }
              router.push('/lucky-weather');
            } else {
              Alert.alert(
                'Locked',
                'You have used your free weekly Lucky Weather. Spend 100 credits to unlock, or wait until next week.',
                [
                  { text: 'Unlock (100 credits)', onPress: () => {
                    const spent = spendCredits(100);
                    if (spent) {
                      router.push('/lucky-weather');
                    } else {
                      Alert.alert('Not Enough Credits', `You have ${credits} credits. Play games to earn more!`);
                    }
                  }},
                  { text: 'Cancel' },
                ]
              );
            }
          }}
          activeOpacity={0.85}
          testID="horoscope-weather"
        >
          <View style={[styles.linkIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.25)' }]}>
            <CloudSun size={22} color="#F59E0B" />
          </View>
          <View style={styles.linkInfo}>
            <Text style={styles.linkTitle}>Lucky Weather</Text>
            <Text style={styles.linkSub}>
              {isPro ? 'Unlimited access' : canUseWeather ? `${freeWeatherUsesLeft} free this week` : 'Unlock with 100 credits'}
            </Text>
          </View>
          {!isPro && !canUseWeather ? <Lock size={16} color={Colors.textMuted} /> : <ChevronRight size={18} color={Colors.textMuted} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => router.push('/name-numbers')}
          activeOpacity={0.85}
          testID="horoscope-name-numbers"
        >
          <View style={[styles.linkIconWrap, { backgroundColor: 'rgba(155, 89, 182, 0.1)', borderColor: 'rgba(155, 89, 182, 0.25)' }]}>
            <Hash size={22} color="#9B59B6" />
          </View>
          <View style={styles.linkInfo}>
            <Text style={styles.linkTitle}>Names & Numbers</Text>
            <Text style={styles.linkSub}>Numerology analysis for your name</Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => {
            if (isPro || canUseBabyNames) {
              if (!isPro && canUseBabyNames) {
                useBabyNamesUse();
              }
              router.push('/name-numbers');
            } else {
              Alert.alert(
                'Locked',
                'You have used your free weekly Baby Name Generator. Spend 100 credits to unlock, or wait until next week.',
                [
                  { text: 'Unlock (100 credits)', onPress: () => {
                    const spent = spendCredits(100);
                    if (spent) {
                      router.push('/name-numbers');
                    } else {
                      Alert.alert('Not Enough Credits', `You have ${credits} credits. Play games to earn more!`);
                    }
                  }},
                  { text: 'Cancel' },
                ]
              );
            }
          }}
          activeOpacity={0.85}
          testID="horoscope-baby-names"
        >
          <View style={[styles.linkIconWrap, { backgroundColor: 'rgba(52, 152, 219, 0.1)', borderColor: 'rgba(52, 152, 219, 0.25)' }]}>
            <Baby size={22} color="#3498DB" />
          </View>
          <View style={styles.linkInfo}>
            <Text style={styles.linkTitle}>Baby Name Generator</Text>
            <Text style={styles.linkSub}>
              {isPro ? 'Unlimited access' : canUseBabyNames ? `${freeBabyNamesUsesLeft} free this week` : 'Unlock with 100 credits'}
            </Text>
          </View>
          {!isPro && !canUseBabyNames ? <Lock size={16} color={Colors.textMuted} /> : <ChevronRight size={18} color={Colors.textMuted} />}
        </TouchableOpacity>

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
    gap: 16,
  },
  signSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  signSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  signSymbol: {
    fontSize: 36,
    color: Colors.gold,
  },
  signName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  signDates: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  signSelectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  elementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  elementText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerItem: {
    width: '30%' as any,
    flexGrow: 1,
    flexBasis: '28%',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceLight,
  },
  pickerSymbol: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  pickerName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  pickerElementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 14,
  },
  loadingText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 14,
  },
  errorText: {
    fontSize: 15,
    color: Colors.red,
    fontWeight: '600' as const,
  },
  retryBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1A1200',
  },
  mainCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCardTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  mainCardDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  horoscopeDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  insightCard: {
    width: '48%' as any,
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  luckyNumber: {
    color: Colors.gold,
    fontSize: 22,
    fontWeight: '900' as const,
  },
  luckyTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  luckyTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  luckyTimeLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  luckyTimeValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  luckyTimeBadge: {
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  luckyTimeBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  planetaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 209, 0.2)',
  },
  planetaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planetaryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planetaryTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  planetsGrid: {
    gap: 10,
  },
  planetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planetSymbolWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
  },
  planetSymbolText: {
    fontSize: 20,
  },
  planetInfo: {
    flex: 1,
    gap: 2,
  },
  planetNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planetName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  retroBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  retroText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#E74C3C',
  },
  planetSign: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  planetDegree: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  planetHouse: {
    alignItems: 'center',
    gap: 2,
  },
  planetHouseLabel: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
  },
  planetHouseNum: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  planetsEmpty: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
  tipCard: {
    backgroundColor: Colors.goldMuted,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  linkInfo: {
    flex: 1,
    gap: 3,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  linkSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  gateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(10, 10, 10, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  gateCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
    width: '100%',
    maxWidth: 360,
  },
  gateTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.gold,
    marginTop: 8,
  },
  gateSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  gateFreeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    marginTop: 8,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gateFreeBtnText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  gateCreditBtn: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldMuted,
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  gateCreditBtnText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  gateCreditBadge: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gateCreditBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  gateEarnBtn: {
    paddingVertical: 10,
  },
  gateEarnBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
    textDecorationLine: 'underline' as const,
  },
});
