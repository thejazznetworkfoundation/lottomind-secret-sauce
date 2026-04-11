import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudSun,
  Sun,
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  Sparkles,
  RefreshCw,
  MapPin,
  Snowflake,
  CloudFog,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import AnimatedCard from '@/components/AnimatedCard';
import LottoBall from '@/components/LottoBall';
import { useGamification } from '@/providers/GamificationProvider';
import { usePro } from '@/providers/ProProvider';

interface WeatherData {
  location: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  description: string;
  icon: string;
  condition: string;
}

interface LuckyWeatherResult {
  numbers: number[];
  bonus: number;
  insight: string;
  weatherScore: number;
  element: string;
}

const WEATHER_CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { name: 'Houston', lat: 29.7604, lon: -95.3698 },
  { name: 'Miami', lat: 25.7617, lon: -80.1918 },
  { name: 'Atlanta', lat: 33.749, lon: -84.388 },
  { name: 'Denver', lat: 39.7392, lon: -104.9903 },
  { name: 'Seattle', lat: 47.6062, lon: -122.3321 },
  { name: 'Phoenix', lat: 33.4484, lon: -112.074 },
  { name: 'Dallas', lat: 32.7767, lon: -96.797 },
  { name: 'Las Vegas', lat: 36.1699, lon: -115.1398 },
  { name: 'Detroit', lat: 42.3314, lon: -83.0458 },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateWeatherNumbers(weather: WeatherData): LuckyWeatherResult {
  const seed = Math.round(weather.temp * 100) + Math.round(weather.humidity * 73) +
    Math.round(weather.windSpeed * 37) + Math.round(weather.pressure * 11);
  const rand = seededRandom(seed);

  const numbers: number[] = [];
  while (numbers.length < 5) {
    const n = Math.floor(rand() * 69) + 1;
    if (!numbers.includes(n)) {
      numbers.push(n);
    }
  }
  numbers.sort((a, b) => a - b);

  const bonus = Math.floor(rand() * 26) + 1;

  const tempScore = weather.temp > 70 ? 85 : weather.temp > 50 ? 70 : 55;
  const humidityBonus = weather.humidity > 60 ? 10 : weather.humidity < 30 ? 5 : 8;
  const windBonus = weather.windSpeed > 15 ? 12 : weather.windSpeed > 8 ? 8 : 4;
  const weatherScore = Math.min(99, tempScore + humidityBonus + windBonus);

  let element = 'Neutral';
  let insight = '';

  const cond = weather.condition.toLowerCase();
  if (cond.includes('thunder') || cond.includes('lightning')) {
    element = 'Lightning';
    insight = 'Electrifying atmospheric energy detected! Storm-charged numbers carry powerful voltage — high-risk, high-reward picks aligned with chaotic probability waves.';
  } else if (cond.includes('rain') || cond.includes('drizzle')) {
    element = 'Rain';
    insight = 'Water energy flows through your numbers. Rain cycles create rhythmic probability patterns — these picks resonate with fluid, recurring draw frequencies.';
  } else if (cond.includes('snow') || cond.includes('sleet')) {
    element = 'Ice';
    insight = 'Crystalline ice patterns form unique probability signatures. Cold-locked numbers tend to align with rare, high-value draw outcomes.';
  } else if (cond.includes('cloud') || cond.includes('overcast')) {
    element = 'Cloud';
    insight = 'Overcast skies diffuse energy evenly across the number field. Cloud-tuned picks favor balanced, mid-range distributions with steady hit potential.';
  } else if (cond.includes('clear') || cond.includes('sun')) {
    element = 'Solar';
    insight = 'Clear solar energy amplifies number resonance! Sun-aligned picks carry strong positive alignment — historically correlated with jackpot-class draws.';
  } else if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
    element = 'Mist';
    insight = 'Mysterious mist energy obscures obvious patterns, revealing hidden number sequences. Fog-born picks tap into overlooked probability corridors.';
  } else if (cond.includes('wind')) {
    element = 'Wind';
    insight = 'High wind energy scatters probability across the number field. Wind-driven picks favor outlier numbers that break from expected patterns.';
  } else {
    element = 'Neutral';
    insight = 'Stable atmospheric conditions create a balanced probability field. Neutral weather picks blend frequency and recency for well-rounded selections.';
  }

  return { numbers, bonus, insight, weatherScore, element };
}

function getWeatherIcon(condition: string, size: number, color: string) {
  const cond = condition.toLowerCase();
  if (cond.includes('thunder') || cond.includes('lightning')) return <CloudLightning size={size} color={color} />;
  if (cond.includes('rain') || cond.includes('drizzle')) return <CloudRain size={size} color={color} />;
  if (cond.includes('snow') || cond.includes('sleet')) return <CloudSnow size={size} color={color} />;
  if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) return <CloudFog size={size} color={color} />;
  if (cond.includes('cloud') || cond.includes('overcast')) return <Cloud size={size} color={color} />;
  if (cond.includes('clear') || cond.includes('sun')) return <Sun size={size} color={color} />;
  return <CloudSun size={size} color={color} />;
}

function getElementColor(element: string): string {
  switch (element) {
    case 'Lightning': return '#A855F7';
    case 'Rain': return '#3B82F6';
    case 'Ice': return '#67E8F9';
    case 'Cloud': return '#94A3B8';
    case 'Solar': return '#F59E0B';
    case 'Mist': return '#818CF8';
    case 'Wind': return '#34D399';
    default: return Colors.gold;
  }
}

function getElementEmoji(element: string): string {
  switch (element) {
    case 'Lightning': return '⚡';
    case 'Rain': return '🌧️';
    case 'Ice': return '❄️';
    case 'Cloud': return '☁️';
    case 'Solar': return '☀️';
    case 'Mist': return '🌫️';
    case 'Wind': return '💨';
    default: return '🌤️';
  }
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,visibility`;
  console.log('[LuckyWeather] Fetching weather:', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather API error');
  const data = await res.json();
  const current = data.current;

  const tempF = current.temperature_2m * 9 / 5 + 32;
  const feelsF = current.apparent_temperature * 9 / 5 + 32;

  const wmoCode = current.weather_code;
  let condition = 'Clear';
  let description = 'Clear sky';
  if (wmoCode === 0) { condition = 'Clear'; description = 'Clear sky'; }
  else if (wmoCode <= 3) { condition = 'Cloudy'; description = 'Partly cloudy'; }
  else if (wmoCode <= 48) { condition = 'Fog'; description = 'Foggy'; }
  else if (wmoCode <= 57) { condition = 'Drizzle'; description = 'Light drizzle'; }
  else if (wmoCode <= 67) { condition = 'Rain'; description = 'Rainy'; }
  else if (wmoCode <= 77) { condition = 'Snow'; description = 'Snowy'; }
  else if (wmoCode <= 82) { condition = 'Rain'; description = 'Rain showers'; }
  else if (wmoCode <= 86) { condition = 'Snow'; description = 'Snow showers'; }
  else if (wmoCode <= 99) { condition = 'Thunderstorm'; description = 'Thunderstorm'; }

  return {
    location: '',
    temp: Math.round(tempF),
    feelsLike: Math.round(feelsF),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m * 0.621371),
    pressure: Math.round(current.surface_pressure),
    visibility: Math.round((current.visibility ?? 10000) / 1609.34),
    description,
    icon: '',
    condition,
  };
}

const WEATHER_UNLOCK_COST = 100;

export default function LuckyWeatherScreen() {
  console.log('[LuckyWeatherScreen] rendered');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { credits, spendCredits } = useGamification();
  const { isPro } = usePro();
  const [selectedCity, setSelectedCity] = useState(WEATHER_CITIES[0]);
  const [luckyResult, setLuckyResult] = useState<LuckyWeatherResult | null>(null);
  const [showNumbers, setShowNumbers] = useState(false);
  const [isWeatherUnlocked, setIsWeatherUnlocked] = useState<boolean>(false);

  useEffect(() => {
    if (isPro) {
      setIsWeatherUnlocked(true);
    }
  }, [isPro]);

  const handleUnlockWithCredits = useCallback(() => {
    if (credits >= WEATHER_UNLOCK_COST) {
      const spent = spendCredits(WEATHER_UNLOCK_COST);
      if (spent) {
        setIsWeatherUnlocked(true);
        console.log('[LuckyWeather] Unlocked with 100 credits');
        if (Platform.OS !== 'web') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } else {
      Alert.alert(
        'Not Enough Credits',
        `You need ${WEATHER_UNLOCK_COST} credits to unlock Lucky Weather. You have ${credits}. Play games to earn more!`,
        [
          { text: 'Play Games', onPress: () => router.push('/trivia-rewards' as never) },
          { text: 'OK' },
        ]
      );
    }
  }, [credits, spendCredits, router]);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const weatherCardAnim = useRef(new Animated.Value(0)).current;
  const numbersAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const scoreBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(headerAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(weatherCardAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [headerAnim, weatherCardAnim, pulseAnim]);

  const weatherQuery = useQuery({
    queryKey: ['lucky-weather', selectedCity.name],
    queryFn: () => fetchWeather(selectedCity.lat, selectedCity.lon),
    staleTime: 5 * 60 * 1000,
  });

  const handleCitySelect = useCallback((city: typeof WEATHER_CITIES[0]) => {
    setSelectedCity(city);
    setLuckyResult(null);
    setShowNumbers(false);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  const handleGenerate = useCallback(() => {
    if (!weatherQuery.data) return;
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    const result = generateWeatherNumbers(weatherQuery.data);
    setLuckyResult(result);
    setShowNumbers(false);

    Animated.timing(numbersAnim, { toValue: 0, duration: 0, useNativeDriver: true }).start(() => {
      setShowNumbers(true);
      Animated.spring(numbersAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }).start();
      Animated.timing(scoreBarAnim, { toValue: result.weatherScore / 100, duration: 1200, useNativeDriver: false }).start();
    });

    if (Platform.OS !== 'web') {
      setTimeout(() => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 500);
    }
  }, [weatherQuery.data, numbersAnim, scoreBarAnim]);

  const weather = weatherQuery.data;
  const elementColor = luckyResult ? getElementColor(luckyResult.element) : Colors.gold;

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const scoreBarWidth = scoreBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      {!isWeatherUnlocked && (
        <View style={styles.gateOverlay}>
          <View style={styles.gateCard}>
            <CloudLightning size={48} color="#F59E0B" />
            <Text style={styles.gateTitle}>Lucky Weather</Text>
            <Text style={styles.gateSub}>
              Unlock weather-powered lucky numbers by spending {WEATHER_UNLOCK_COST} Mind Credits
            </Text>
            <View style={styles.gateCreditInfo}>
              <Text style={styles.gateCreditInfoText}>You have {credits} credits</Text>
            </View>
            <TouchableOpacity
              style={[styles.gateUnlockBtn, credits < WEATHER_UNLOCK_COST && styles.gateUnlockBtnDisabled]}
              onPress={handleUnlockWithCredits}
              activeOpacity={0.85}
              testID="weather-unlock-btn"
            >
              <Sparkles size={18} color={credits >= WEATHER_UNLOCK_COST ? '#0A0A0A' : Colors.textMuted} />
              <Text style={[styles.gateUnlockBtnText, credits < WEATHER_UNLOCK_COST && styles.gateUnlockBtnTextDisabled]}>
                Unlock for {WEATHER_UNLOCK_COST} Credits
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gateEarnBtn}
              onPress={() => router.push('/trivia-rewards' as never)}
              activeOpacity={0.7}
            >
              <Text style={styles.gateEarnBtnText}>Play Games & Earn Credits</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gateBackBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={16} color={Colors.textMuted} />
              <Text style={styles.gateBackBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} pointerEvents={isWeatherUnlocked ? 'auto' : 'none'}>
        <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ scale: headerAnim }] }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7} testID="back-btn">
            <ArrowLeft size={22} color={Colors.gold} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Animated.View style={{ opacity: pulseOpacity }}>
              <CloudLightning size={24} color="#F59E0B" />
            </Animated.View>
            <Text style={styles.headerTitle}>Lucky Weather</Text>
          </View>
          <TouchableOpacity
            onPress={() => weatherQuery.refetch()}
            style={styles.refreshBtn}
            activeOpacity={0.7}
            testID="refresh-btn"
          >
            <RefreshCw size={18} color={Colors.gold} />
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.sectionLabel}>Select City</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cityRow}
          style={styles.cityScroll}
        >
          {WEATHER_CITIES.map((city) => {
            const isActive = city.name === selectedCity.name;
            return (
              <TouchableOpacity
                key={city.name}
                style={[styles.cityChip, isActive && styles.cityChipActive]}
                onPress={() => handleCitySelect(city)}
                activeOpacity={0.7}
                testID={`city-${city.name}`}
              >
                <MapPin size={12} color={isActive ? '#0A0A0A' : Colors.textSecondary} />
                <Text style={[styles.cityText, isActive && styles.cityTextActive]}>{city.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {weatherQuery.isLoading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.gold} />
            <Text style={styles.loadingText}>Reading atmospheric data...</Text>
          </View>
        )}

        {weatherQuery.error && (
          <AnimatedCard style={styles.errorCard} delay={100}>
            <Text style={styles.errorText}>Failed to load weather data. Tap refresh to try again.</Text>
          </AnimatedCard>
        )}

        {weather && !weatherQuery.isLoading && (
          <>
            <AnimatedCard style={styles.weatherCard} delay={200} depth="deep" glowColor="rgba(245, 158, 11, 0.2)">
              <View style={styles.weatherMain}>
                <View style={styles.weatherIconWrap}>
                  {getWeatherIcon(weather.condition, 48, '#F59E0B')}
                </View>
                <View style={styles.weatherInfo}>
                  <Text style={styles.weatherTemp}>{weather.temp}°F</Text>
                  <Text style={styles.weatherDesc}>{weather.description}</Text>
                  <Text style={styles.weatherCity}>
                    <MapPin size={12} color={Colors.textMuted} /> {selectedCity.name}
                  </Text>
                </View>
              </View>

              <View style={styles.weatherGrid}>
                <View style={styles.weatherStat}>
                  <Thermometer size={14} color="#EF4444" />
                  <Text style={styles.weatherStatLabel}>Feels Like</Text>
                  <Text style={styles.weatherStatValue}>{weather.feelsLike}°F</Text>
                </View>
                <View style={styles.weatherStat}>
                  <Droplets size={14} color="#3B82F6" />
                  <Text style={styles.weatherStatLabel}>Humidity</Text>
                  <Text style={styles.weatherStatValue}>{weather.humidity}%</Text>
                </View>
                <View style={styles.weatherStat}>
                  <Wind size={14} color="#34D399" />
                  <Text style={styles.weatherStatLabel}>Wind</Text>
                  <Text style={styles.weatherStatValue}>{weather.windSpeed} mph</Text>
                </View>
                <View style={styles.weatherStat}>
                  <Gauge size={14} color="#A855F7" />
                  <Text style={styles.weatherStatLabel}>Pressure</Text>
                  <Text style={styles.weatherStatValue}>{weather.pressure} hPa</Text>
                </View>
                <View style={styles.weatherStat}>
                  <Eye size={14} color="#F59E0B" />
                  <Text style={styles.weatherStatLabel}>Visibility</Text>
                  <Text style={styles.weatherStatValue}>{weather.visibility} mi</Text>
                </View>
              </View>
            </AnimatedCard>

            <TouchableOpacity
              style={styles.generateBtn}
              onPress={handleGenerate}
              activeOpacity={0.85}
              testID="generate-weather-numbers"
            >
              <View style={styles.generateBtnGlow} />
              <View style={styles.generateBtnInner}>
                <Sparkles size={20} color="#0A0A0A" />
                <Text style={styles.generateBtnText}>Generate Weather Numbers</Text>
              </View>
            </TouchableOpacity>

            {luckyResult && showNumbers && (
              <Animated.View style={{ opacity: numbersAnim, transform: [{ scale: numbersAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }}>
                <AnimatedCard style={styles.resultCard} delay={0} depth="deep" glowColor={`${elementColor}30`}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultEmoji}>{getElementEmoji(luckyResult.element)}</Text>
                    <View>
                      <Text style={[styles.resultElement, { color: elementColor }]}>{luckyResult.element} Energy</Text>
                      <Text style={styles.resultSubtitle}>Weather-Aligned Lucky Numbers</Text>
                    </View>
                  </View>

                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Weather Luck Score</Text>
                    <Text style={[styles.scoreValue, { color: elementColor }]}>{luckyResult.weatherScore}/100</Text>
                  </View>
                  <View style={styles.scoreBarBg}>
                    <Animated.View style={[styles.scoreBarFill, { width: scoreBarWidth, backgroundColor: elementColor }]} />
                  </View>

                  <View style={styles.numbersWrap}>
                    {luckyResult.numbers.map((n, i) => (
                      <LottoBall key={`main-${i}`} number={n} delay={i * 120} size={52} />
                    ))}
                    <LottoBall number={luckyResult.bonus} isBonus delay={600} size={52} />
                  </View>

                  <View style={[styles.insightCard, { borderColor: `${elementColor}30` }]}>
                    <Sparkles size={14} color={elementColor} />
                    <Text style={styles.insightText}>{luckyResult.insight}</Text>
                  </View>

                  <View style={styles.conditionsRow}>
                    <View style={styles.conditionTag}>
                      <Thermometer size={12} color={Colors.textSecondary} />
                      <Text style={styles.conditionText}>{weather.temp}°F</Text>
                    </View>
                    <View style={styles.conditionTag}>
                      <Droplets size={12} color={Colors.textSecondary} />
                      <Text style={styles.conditionText}>{weather.humidity}%</Text>
                    </View>
                    <View style={styles.conditionTag}>
                      <Wind size={12} color={Colors.textSecondary} />
                      <Text style={styles.conditionText}>{weather.windSpeed}mph</Text>
                    </View>
                    <View style={[styles.conditionTag, { borderColor: `${elementColor}40` }]}>
                      <Text style={[styles.conditionText, { color: elementColor }]}>{weather.condition}</Text>
                    </View>
                  </View>
                </AnimatedCard>
              </Animated.View>
            )}
          </>
        )}

        <AnimatedCard style={styles.infoCard} delay={400} depth="shallow">
          <Text style={styles.infoTitle}>How Lucky Weather Works</Text>
          <View style={styles.infoRow}>
            <View style={[styles.infoDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.infoText}>Real-time weather data is analyzed from your selected city</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.infoDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.infoText}>Temperature, humidity, pressure, and wind create a unique probability seed</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.infoDot, { backgroundColor: '#A855F7' }]} />
            <Text style={styles.infoText}>Weather conditions determine your element alignment and energy type</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.infoDot, { backgroundColor: '#34D399' }]} />
            <Text style={styles.infoText}>Numbers are generated using atmospheric energy signatures</Text>
          </View>
        </AnimatedCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 14,
    marginBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  headerCenter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
    marginLeft: 4,
  },
  cityScroll: {
    marginBottom: 16,
  },
  cityRow: {
    flexDirection: 'row' as const,
    gap: 8,
    paddingRight: 16,
  },
  cityChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cityChipActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  cityText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  cityTextActive: {
    color: '#0A0A0A',
  },
  loadingWrap: {
    alignItems: 'center' as const,
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  errorCard: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.25)',
    padding: 20,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.red,
    textAlign: 'center' as const,
  },
  weatherCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    padding: 20,
    marginBottom: 16,
  },
  weatherMain: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
    marginBottom: 18,
  },
  weatherIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 38,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  weatherDesc: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#F59E0B',
    marginTop: 2,
  },
  weatherCity: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  weatherGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  weatherStat: {
    flex: 1,
    minWidth: '28%' as unknown as number,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center' as const,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  weatherStatLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  weatherStatValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  generateBtn: {
    borderRadius: 16,
    overflow: 'hidden' as const,
    marginBottom: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  generateBtnGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F59E0B',
    opacity: 0.15,
    borderRadius: 16,
  },
  generateBtnInner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    backgroundColor: '#F59E0B',
    paddingVertical: 18,
    borderRadius: 16,
  },
  generateBtnText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#0A0A0A',
    letterSpacing: 0.3,
  },
  resultCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    padding: 20,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 16,
  },
  resultEmoji: {
    fontSize: 36,
  },
  resultElement: {
    fontSize: 18,
    fontWeight: '800' as const,
    letterSpacing: 0.3,
  },
  resultSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '800' as const,
  },
  scoreBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 20,
    overflow: 'hidden' as const,
  },
  scoreBarFill: {
    height: 6,
    borderRadius: 3,
  },
  numbersWrap: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row' as const,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  conditionsRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  conditionTag: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 20,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 10,
    marginBottom: 10,
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  gateOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(10, 10, 10, 0.94)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 30,
  },
  gateCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center' as const,
    gap: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    width: '100%' as const,
    maxWidth: 360,
  },
  gateTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#F59E0B',
    marginTop: 8,
  },
  gateSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  gateCreditInfo: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  gateCreditInfoText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#F59E0B',
  },
  gateUnlockBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%' as const,
    marginTop: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gateUnlockBtnDisabled: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    shadowOpacity: 0,
    elevation: 0,
  },
  gateUnlockBtnText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#0A0A0A',
  },
  gateUnlockBtnTextDisabled: {
    color: Colors.textMuted,
  },
  gateEarnBtn: {
    paddingVertical: 10,
  },
  gateEarnBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#F59E0B',
    textDecorationLine: 'underline' as const,
  },
  gateBackBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 6,
  },
  gateBackBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
});
