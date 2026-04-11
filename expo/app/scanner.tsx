import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import {
  ScanLine,
  Camera,
  ImageIcon,
  ChevronLeft,
  Check,
  Trophy,
  Target,
  Keyboard,
  TriangleAlert,
  Sparkles,
  PartyPopper,
  XCircle,
  RotateCcw,
  DollarSign,
  Calendar,
  Hash,
  Award,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { GAME_CONFIGS } from '@/constants/games';
import { useLotto } from '@/providers/LottoProvider';
import GameSwitcher from '@/components/GameSwitcher';
import {
  scanTicketImage,
  checkTicketAgainstDraws,
  manualTicketEntry,
  ScannedTicket,
  TicketCheckResult,
} from '@/utils/ticketScanner';
import { useMutation } from '@tanstack/react-query';

type InputMode = 'camera' | 'manual';

function computeTotalPrize(result: TicketCheckResult): string {
  let total = 0;
  let hasJackpot = false;
  for (const m of result.matchedDraws) {
    if (m.prize === 'No prize') continue;
    if (m.prize === 'JACKPOT') {
      hasJackpot = true;
      continue;
    }
    const num = parseInt(m.prize.replace(/[$,]/g, ''), 10);
    if (!isNaN(num)) total += num;
  }
  if (hasJackpot) return 'JACKPOT!';
  if (total === 0) return '$0';
  return `$${total.toLocaleString()}`;
}

function isWinner(result: TicketCheckResult): boolean {
  return result.matchedDraws.some((m) => m.prize !== 'No prize');
}

function getPrizeDraws(result: TicketCheckResult) {
  return result.matchedDraws.filter((m) => m.prize !== 'No prize');
}

function PulsingGlow({ color, children }: { color: string; children: React.ReactNode }) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <View style={{ position: 'relative' }}>
      <Animated.View
        style={{
          position: 'absolute',
          top: -8,
          left: -8,
          right: -8,
          bottom: -8,
          borderRadius: 28,
          backgroundColor: color,
          opacity: pulseAnim,
        }}
      />
      {children}
    </View>
  );
}

export default function ScannerScreen() {
  console.log('[ScannerScreen] rendered');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentGame, switchGame, liveDraws } = useLotto();
  const config = GAME_CONFIGS[currentGame];

  const [mode, setMode] = useState<InputMode>('camera');
  const [scannedTicket, setScannedTicket] = useState<ScannedTicket | null>(null);
  const [checkResult, setCheckResult] = useState<TicketCheckResult | null>(null);
  const [manualNumbers, setManualNumbers] = useState<string>('');
  const [manualBonus, setManualBonus] = useState<string>('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const resultScaleAnim = useRef(new Animated.Value(0.9)).current;
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const scanMutation = useMutation({
    mutationFn: async (base64: string) => {
      const ticket = await scanTicketImage(base64);
      return ticket;
    },
    onSuccess: (ticket) => {
      console.log('[Scanner] Ticket scanned:', ticket);
      setScannedTicket(ticket);
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      animateResult();
    },
    onError: (error) => {
      console.log('[Scanner] Scan error:', error);
      Alert.alert('Scan Failed', 'Could not read the ticket. Try again or enter numbers manually.');
    },
  });

  const animateResult = useCallback(() => {
    fadeAnim.setValue(0);
    resultScaleAnim.setValue(0.9);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(resultScaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start();
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  }, [fadeAnim, resultScaleAnim]);

  const animateCelebration = useCallback(() => {
    celebrateAnim.setValue(0);
    fadeAnim.setValue(0);
    resultScaleAnim.setValue(0.8);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(resultScaleAnim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(celebrateAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 400);
  }, [celebrateAnim, fadeAnim, resultScaleAnim]);

  const handlePickImage = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Please grant photo library access to scan tickets.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]?.base64) return;
      setScannedTicket(null);
      setCheckResult(null);
      scanMutation.mutate(result.assets[0].base64);
    } catch (error) {
      console.log('[Scanner] Image pick error:', error);
    }
  }, [scanMutation]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Please grant camera access to scan tickets.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]?.base64) return;
      setScannedTicket(null);
      setCheckResult(null);
      scanMutation.mutate(result.assets[0].base64);
    } catch (error) {
      console.log('[Scanner] Camera error:', error);
    }
  }, [scanMutation]);

  const handleManualCheck = useCallback(() => {
    const nums = manualNumbers
      .split(/[,\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= config.mainRange);

    if (nums.length !== config.mainCount) {
      Alert.alert('Invalid Numbers', `Please enter exactly ${config.mainCount} numbers between 1 and ${config.mainRange}.`);
      return;
    }

    const bonus = manualBonus.trim() ? parseInt(manualBonus.trim(), 10) : null;
    if (bonus !== null && (isNaN(bonus) || bonus < 1 || bonus > config.bonusRange)) {
      Alert.alert('Invalid Bonus', `${config.bonusName} must be between 1 and ${config.bonusRange}.`);
      return;
    }

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const ticket = manualTicketEntry(nums, bonus, currentGame);
    setScannedTicket(ticket);
    setCheckResult(null);
    animateResult();
  }, [manualNumbers, manualBonus, config, currentGame, animateResult]);

  const handleCheckTicket = useCallback(() => {
    if (!scannedTicket) return;

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    const result = checkTicketAgainstDraws(scannedTicket, liveDraws, currentGame);
    setCheckResult(result);

    if (isWinner(result)) {
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      animateCelebration();
    } else {
      animateResult();
    }
  }, [scannedTicket, liveDraws, currentGame, animateResult, animateCelebration]);

  const handleScanAnother = useCallback(() => {
    setScannedTicket(null);
    setCheckResult(null);
    setManualNumbers('');
    setManualBonus('');
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const won = useMemo(() => checkResult ? isWinner(checkResult) : false, [checkResult]);
  const totalPrize = useMemo(() => checkResult ? computeTotalPrize(checkResult) : '$0', [checkResult]);
  const prizeDraws = useMemo(() => checkResult ? getPrizeDraws(checkResult) : [], [checkResult]);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="scanner-back">
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <ScanLine size={22} color="#00E676" />
        <Text style={styles.headerTitle}>Ticket Scanner</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{liveDraws.length} draws</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GameSwitcher currentGame={currentGame} onSwitch={switchGame} />

        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'camera' && styles.modeBtnActive]}
            onPress={() => setMode('camera')}
            activeOpacity={0.7}
          >
            <Camera size={18} color={mode === 'camera' ? '#0A0A0A' : Colors.textSecondary} />
            <Text style={[styles.modeBtnText, mode === 'camera' && styles.modeBtnTextActive]}>
              Scan Ticket
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'manual' && styles.modeBtnActive]}
            onPress={() => setMode('manual')}
            activeOpacity={0.7}
          >
            <Keyboard size={18} color={mode === 'manual' ? '#0A0A0A' : Colors.textSecondary} />
            <Text style={[styles.modeBtnText, mode === 'manual' && styles.modeBtnTextActive]}>
              Manual Entry
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'camera' && !checkResult && (
          <View style={styles.scanSection}>
            <View style={styles.scanCard}>
              <View style={styles.scanIconWrap}>
                <ScanLine size={48} color="#00E676" />
              </View>
              <Text style={styles.scanTitle}>Scan Your Lottery Ticket</Text>
              <Text style={styles.scanSubtitle}>
                Take a photo or pick from gallery — AI reads the numbers automatically.
              </Text>
              <View style={styles.scanActions}>
                <TouchableOpacity
                  style={styles.scanBtn}
                  onPress={handleTakePhoto}
                  activeOpacity={0.85}
                  disabled={scanMutation.isPending}
                  testID="scanner-camera"
                >
                  <Camera size={20} color="#0A0A0A" />
                  <Text style={styles.scanBtnText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.scanBtnOutline}
                  onPress={handlePickImage}
                  activeOpacity={0.85}
                  disabled={scanMutation.isPending}
                  testID="scanner-gallery"
                >
                  <ImageIcon size={20} color="#00E676" />
                  <Text style={styles.scanBtnOutlineText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>

            {scanMutation.isPending && (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color="#00E676" />
                <Text style={styles.loadingText}>AI is reading your ticket...</Text>
              </View>
            )}
          </View>
        )}

        {mode === 'manual' && !checkResult && (
          <View style={styles.manualSection}>
            <View style={styles.manualCard}>
              <Text style={styles.manualLabel}>
                Enter {config.mainCount} numbers (1-{config.mainRange})
              </Text>
              <TextInput
                style={styles.manualInput}
                placeholder="e.g. 5, 12, 23, 38, 52"
                placeholderTextColor={Colors.textMuted}
                value={manualNumbers}
                onChangeText={setManualNumbers}
                keyboardType="numeric"
                testID="manual-numbers"
              />
              <Text style={styles.manualLabel}>{config.bonusName} (1-{config.bonusRange})</Text>
              <TextInput
                style={styles.manualInput}
                placeholder="e.g. 14"
                placeholderTextColor={Colors.textMuted}
                value={manualBonus}
                onChangeText={setManualBonus}
                keyboardType="numeric"
                testID="manual-bonus"
              />
              <TouchableOpacity
                style={styles.manualSubmitBtn}
                onPress={handleManualCheck}
                activeOpacity={0.85}
                testID="manual-submit"
              >
                <Check size={20} color="#0A0A0A" />
                <Text style={styles.manualSubmitText}>Enter Numbers</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {scannedTicket && !checkResult && (
          <Animated.View style={[styles.ticketResult, { opacity: fadeAnim, transform: [{ scale: resultScaleAnim }] }]}>
            <View style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Sparkles size={18} color="#00E676" />
                <Text style={styles.ticketTitle}>Your Numbers</Text>
                {scannedTicket.confidence < 100 && (
                  <View style={styles.confidencePill}>
                    <Text style={styles.confidenceText}>{scannedTicket.confidence}% sure</Text>
                  </View>
                )}
              </View>

              <View style={styles.ticketBalls}>
                {scannedTicket.numbers.map((num, idx) => (
                  <View key={`scan-${idx}-${num}`} style={styles.ticketBall}>
                    <Text style={styles.ticketBallText}>{num}</Text>
                  </View>
                ))}
                {scannedTicket.bonusNumber !== null && (
                  <>
                    <Text style={styles.ticketPlus}>+</Text>
                    <View style={styles.ticketBonusBall}>
                      <Text style={styles.ticketBonusText}>{scannedTicket.bonusNumber}</Text>
                    </View>
                  </>
                )}
              </View>

              {scannedTicket.gameDetected && (
                <Text style={styles.detectedGame}>
                  Detected: {GAME_CONFIGS[scannedTicket.gameDetected]?.name ?? 'Unknown'}
                </Text>
              )}

              <TouchableOpacity
                style={styles.checkBtn}
                onPress={handleCheckTicket}
                activeOpacity={0.85}
                testID="check-ticket"
              >
                <Target size={20} color="#0A0A0A" />
                <Text style={styles.checkBtnText}>Check If I Won</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {checkResult && won && (
          <Animated.View style={[styles.checkSection, { opacity: fadeAnim, transform: [{ scale: resultScaleAnim }] }]}>
            <PulsingGlow color="rgba(212, 175, 55, 0.12)">
              <View style={styles.winnerCard}>
                <View style={styles.winnerIconRow}>
                  <Trophy size={32} color={Colors.gold} />
                  <PartyPopper size={28} color="#FFD700" />
                </View>
                <Text style={styles.winnerTitle}>YOU'RE A WINNER!</Text>
                <Text style={styles.winnerSubtitle}>Congratulations on your match!</Text>

                <View style={styles.totalPrizeWrap}>
                  <DollarSign size={22} color={Colors.gold} />
                  <Text style={styles.totalPrizeText}>{totalPrize}</Text>
                </View>
                <Text style={styles.totalPrizeLabel}>Total Prize Amount</Text>

                <View style={styles.winnerNumbersSection}>
                  <Text style={styles.winnerNumbersLabel}>Your Numbers</Text>
                  <View style={styles.winnerBallsRow}>
                    {checkResult.ticket.numbers.map((num, idx) => {
                      const anyMatch = checkResult.matchedDraws.some((m) => m.mainMatches.includes(num));
                      return (
                        <View
                          key={`wn-${idx}-${num}`}
                          style={[styles.winnerBall, anyMatch && styles.winnerBallMatched]}
                        >
                          <Text style={[styles.winnerBallText, anyMatch && styles.winnerBallTextMatched]}>
                            {num}
                          </Text>
                          {anyMatch && (
                            <View style={styles.checkmarkBadge}>
                              <Check size={10} color="#0A0A0A" />
                            </View>
                          )}
                        </View>
                      );
                    })}
                    {checkResult.ticket.bonusNumber !== null && (
                      <>
                        <Text style={styles.winnerPlus}>+</Text>
                        <View
                          style={[
                            styles.winnerBonusBall,
                            checkResult.matchedDraws.some((m) => m.bonusMatch) && styles.winnerBonusMatched,
                          ]}
                        >
                          <Text
                            style={[
                              styles.winnerBonusText,
                              checkResult.matchedDraws.some((m) => m.bonusMatch) && styles.winnerBonusTextMatched,
                            ]}
                          >
                            {checkResult.ticket.bonusNumber}
                          </Text>
                          {checkResult.matchedDraws.some((m) => m.bonusMatch) && (
                            <View style={styles.checkmarkBadgeRed}>
                              <Check size={10} color="#fff" />
                            </View>
                          )}
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </PulsingGlow>

            {prizeDraws.length > 0 && (
              <View style={styles.prizeBreakdownCard}>
                <View style={styles.prizeBreakdownHeader}>
                  <Award size={18} color={Colors.gold} />
                  <Text style={styles.prizeBreakdownTitle}>Prize Tier Breakdown</Text>
                </View>
                {prizeDraws.map((match, idx) => (
                  <View key={`prize-${idx}`} style={styles.prizeRow}>
                    <View style={styles.prizeRowLeft}>
                      <View style={styles.prizeDateWrap}>
                        <Calendar size={12} color={Colors.textMuted} />
                        <Text style={styles.prizeDate}>
                          {new Date(match.draw.drawDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.prizeMatchInfo}>
                        <Hash size={12} color="#00E676" />
                        <Text style={styles.prizeMatchCount}>
                          {match.mainMatches.length} main + {match.bonusMatch ? '1 bonus' : '0 bonus'}
                        </Text>
                      </View>
                      <View style={styles.prizeNumbersRow}>
                        {match.draw.numbers.map((n) => (
                          <View
                            key={`pd-${idx}-${n}`}
                            style={[
                              styles.prizeNumBall,
                              match.mainMatches.includes(n) && styles.prizeNumBallHit,
                            ]}
                          >
                            <Text
                              style={[
                                styles.prizeNumText,
                                match.mainMatches.includes(n) && styles.prizeNumTextHit,
                              ]}
                            >
                              {n}
                            </Text>
                          </View>
                        ))}
                        <View
                          style={[
                            styles.prizeBonusBall,
                            match.bonusMatch && styles.prizeBonusBallHit,
                          ]}
                        >
                          <Text
                            style={[
                              styles.prizeBonusText,
                              match.bonusMatch && styles.prizeBonusTextHit,
                            ]}
                          >
                            {match.draw.bonusNumber}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.prizeRowRight}>
                      <Text style={styles.prizeAmount}>{match.prize}</Text>
                      <Text style={styles.prizeTier}>
                        {match.matchCount} match{match.matchCount !== 1 ? 'es' : ''}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.winnerStatsRow}>
              <View style={styles.winnerStatCard}>
                <Text style={styles.winnerStatValue}>{checkResult.bestMatch}</Text>
                <Text style={styles.winnerStatLabel}>Best Match</Text>
              </View>
              <View style={styles.winnerStatCard}>
                <Text style={styles.winnerStatValue}>{liveDraws.length}</Text>
                <Text style={styles.winnerStatLabel}>Draws Checked</Text>
              </View>
              <View style={styles.winnerStatCard}>
                <Text style={[styles.winnerStatValue, { color: Colors.gold }]}>{totalPrize}</Text>
                <Text style={styles.winnerStatLabel}>Total Won</Text>
              </View>
            </View>

            <View style={styles.disclaimerCard}>
              <TriangleAlert size={14} color={Colors.textMuted} />
              <Text style={styles.disclaimerText}>
                For entertainment only. Always verify results with official lottery sources.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.scanAnotherBtn}
              onPress={handleScanAnother}
              activeOpacity={0.85}
              testID="scan-another"
            >
              <RotateCcw size={20} color="#0A0A0A" />
              <Text style={styles.scanAnotherText}>Scan Another Ticket</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {checkResult && !won && (
          <Animated.View style={[styles.checkSection, { opacity: fadeAnim, transform: [{ scale: resultScaleAnim }] }]}>
            <View style={styles.loserCard}>
              <View style={styles.loserIconWrap}>
                <XCircle size={48} color={Colors.textMuted} />
              </View>
              <Text style={styles.loserTitle}>Not a Winner This Time</Text>
              <Text style={styles.loserSubtitle}>
                Keep playing — your lucky draw is coming!
              </Text>

              <View style={styles.loserStatsRow}>
                <View style={styles.loserStatItem}>
                  <Text style={styles.loserStatValue}>{checkResult.bestMatch}</Text>
                  <Text style={styles.loserStatLabel}>Best Match</Text>
                </View>
                <View style={styles.loserStatDivider} />
                <View style={styles.loserStatItem}>
                  <Text style={styles.loserStatValue}>{liveDraws.length}</Text>
                  <Text style={styles.loserStatLabel}>Draws Checked</Text>
                </View>
                <View style={styles.loserStatDivider} />
                <View style={styles.loserStatItem}>
                  <Text style={styles.loserStatValue}>$0</Text>
                  <Text style={styles.loserStatLabel}>Winnings</Text>
                </View>
              </View>

              <View style={styles.loserNumbersSection}>
                <Text style={styles.loserNumbersLabel}>Your Numbers</Text>
                <View style={styles.loserBallsRow}>
                  {checkResult.ticket.numbers.map((num, idx) => (
                    <View key={`ln-${idx}-${num}`} style={styles.loserBall}>
                      <Text style={styles.loserBallText}>{num}</Text>
                    </View>
                  ))}
                  {checkResult.ticket.bonusNumber !== null && (
                    <>
                      <Text style={styles.loserPlus}>+</Text>
                      <View style={styles.loserBonusBall}>
                        <Text style={styles.loserBonusText}>{checkResult.ticket.bonusNumber}</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>

            {checkResult.matchedDraws.filter((m) => m.matchCount > 0).length > 0 && (
              <View style={styles.nearMissCard}>
                <Text style={styles.nearMissTitle}>Closest Matches</Text>
                {checkResult.matchedDraws
                  .filter((m) => m.matchCount > 0)
                  .slice(0, 3)
                  .map((match, idx) => (
                    <View key={`nm-${idx}`} style={styles.nearMissRow}>
                      <View style={styles.nearMissLeft}>
                        <Text style={styles.nearMissDate}>
                          {new Date(match.draw.drawDate).toLocaleDateString()}
                        </Text>
                        <View style={styles.nearMissNumbers}>
                          {match.draw.numbers.map((n) => (
                            <View
                              key={`nmd-${idx}-${n}`}
                              style={[
                                styles.nearMissNumBall,
                                match.mainMatches.includes(n) && styles.nearMissNumBallHit,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.nearMissNumText,
                                  match.mainMatches.includes(n) && styles.nearMissNumTextHit,
                                ]}
                              >
                                {n}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      <Text style={styles.nearMissCount}>
                        {match.matchCount} hit{match.matchCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  ))}
              </View>
            )}

            <View style={styles.disclaimerCard}>
              <TriangleAlert size={14} color={Colors.textMuted} />
              <Text style={styles.disclaimerText}>
                For entertainment only. Always verify results with official lottery sources.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.scanAnotherBtn}
              onPress={handleScanAnother}
              activeOpacity={0.85}
              testID="scan-another"
            >
              <RotateCcw size={20} color="#0A0A0A" />
              <Text style={styles.scanAnotherText}>Scan Another Ticket</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#00E676',
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#00E676',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 18,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeBtnActive: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  modeBtnTextActive: {
    color: '#0A0A0A',
  },
  scanSection: {
    gap: 14,
  },
  scanCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  scanIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  scanTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  scanSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  scanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#00E676',
  },
  scanBtnText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#0A0A0A',
  },
  scanBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    backgroundColor: 'rgba(0, 230, 118, 0.06)',
  },
  scanBtnOutlineText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#00E676',
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  loadingText: {
    fontSize: 14,
    color: '#00E676',
    fontWeight: '600' as const,
  },
  manualSection: {
    gap: 14,
  },
  manualCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  manualLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  manualInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  manualSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#00E676',
    marginTop: 4,
  },
  manualSubmitText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#0A0A0A',
  },
  ticketResult: {
    gap: 14,
  },
  ticketCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ticketTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  confidencePill: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#00E676',
  },
  ticketBalls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  ticketBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  ticketBallText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#00E676',
  },
  ticketPlus: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  ticketBonusBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.redMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  ticketBonusText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.red,
  },
  detectedGame: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.gold,
  },
  checkBtnText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#0A0A0A',
  },
  checkSection: {
    gap: 16,
  },

  winnerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.gold,
    overflow: 'hidden',
  },
  winnerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  winnerTitle: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: Colors.gold,
    letterSpacing: 1,
    textAlign: 'center',
  },
  winnerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  totalPrizeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    marginTop: 8,
  },
  totalPrizeText: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.gold,
  },
  totalPrizeLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  winnerNumbersSection: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.goldBorder,
  },
  winnerNumbersLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  winnerBallsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  winnerBall: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    position: 'relative',
  },
  winnerBallMatched: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderColor: '#00E676',
  },
  winnerBallText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textSecondary,
  },
  winnerBallTextMatched: {
    color: '#00E676',
  },
  checkmarkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkBadgeRed: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerPlus: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  winnerBonusBall: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    position: 'relative',
  },
  winnerBonusMatched: {
    backgroundColor: Colors.redMuted,
    borderColor: Colors.red,
  },
  winnerBonusText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textSecondary,
  },
  winnerBonusTextMatched: {
    color: Colors.red,
  },
  prizeBreakdownCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  prizeBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prizeBreakdownTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  prizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  prizeRowLeft: {
    flex: 1,
    gap: 6,
  },
  prizeDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prizeDate: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  prizeMatchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  prizeMatchCount: {
    fontSize: 12,
    color: '#00E676',
    fontWeight: '600' as const,
  },
  prizeNumbersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 3,
  },
  prizeNumBall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prizeNumBallHit: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  prizeNumText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  prizeNumTextHit: {
    color: '#00E676',
    fontWeight: '800' as const,
  },
  prizeBonusBall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginLeft: 2,
  },
  prizeBonusBallHit: {
    backgroundColor: Colors.redMuted,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  prizeBonusText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  prizeBonusTextHit: {
    color: Colors.red,
    fontWeight: '800' as const,
  },
  prizeRowRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  prizeAmount: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: Colors.gold,
  },
  prizeTier: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  winnerStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  winnerStatCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  winnerStatValue: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
  },
  winnerStatLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
  },

  loserCard: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loserIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(102, 102, 102, 0.2)',
  },
  loserTitle: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  loserSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loserStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    width: '100%',
    marginTop: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loserStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  loserStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  loserStatValue: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
  },
  loserStatLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
  },
  loserNumbersSection: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  loserNumbersLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  loserBallsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loserBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  loserBallText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textSecondary,
  },
  loserPlus: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  loserBonusBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(102, 102, 102, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(102, 102, 102, 0.25)',
  },
  loserBonusText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },

  nearMissCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nearMissTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  nearMissRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nearMissLeft: {
    flex: 1,
    gap: 6,
  },
  nearMissDate: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  nearMissNumbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  nearMissNumBall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nearMissNumBallHit: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderColor: 'rgba(0, 230, 118, 0.25)',
  },
  nearMissNumText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  nearMissNumTextHit: {
    color: '#00E676',
    fontWeight: '800' as const,
  },
  nearMissCount: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.textSecondary,
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
  scanAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#00E676',
  },
  scanAnotherText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#0A0A0A',
  },
});
