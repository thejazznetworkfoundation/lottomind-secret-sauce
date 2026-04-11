import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Mail, Send, CheckCircle, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';

const EMAIL_STORAGE_KEY = '@lottomind_collected_emails';
const SUBSCRIBED_KEY = '@lottomind_email_subscribed';

const EmailCollector = React.memo(function EmailCollector() {
  const [email, setEmail] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const inputGlow = useRef(new Animated.Value(0)).current;
  const envelopeFloat = useRef(new Animated.Value(0)).current;
  const shakeAnimJS = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    AsyncStorage.getItem(SUBSCRIBED_KEY).then((val) => {
      if (val === 'true') setIsSubmitted(true);
    }).catch(() => {});

    Animated.loop(
      Animated.sequence([
        Animated.timing(envelopeFloat, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(envelopeFloat, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [envelopeFloat]);

  const validateEmail = useCallback((text: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(text);
  }, []);

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimJS, { toValue: 10, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnimJS, { toValue: -10, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnimJS, { toValue: 8, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnimJS, { toValue: -8, duration: 50, useNativeDriver: false }),
      Animated.timing(shakeAnimJS, { toValue: 0, duration: 50, useNativeDriver: false }),
    ]).start();
  }, [shakeAnimJS]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    if (!email.trim()) {
      setError('Please enter your email');
      triggerShake();
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email');
      triggerShake();
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const stored = await AsyncStorage.getItem(EMAIL_STORAGE_KEY);
      const emails: string[] = stored ? JSON.parse(stored) : [];
      if (!emails.includes(email.trim().toLowerCase())) {
        emails.push(email.trim().toLowerCase());
        await AsyncStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(emails));
      }
      await AsyncStorage.setItem(SUBSCRIBED_KEY, 'true');

      console.log('[EmailCollector] Email saved:', email.trim().toLowerCase());

      setIsSubmitted(true);
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } catch (e) {
      console.log('[EmailCollector] Error saving email:', e);
      Alert.alert('Error', 'Could not save your email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isSubmitting, validateEmail, triggerShake, successScale]);

  const handleFocus = useCallback(() => {
    Animated.timing(inputGlow, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  }, [inputGlow]);

  const handleBlur = useCallback(() => {
    Animated.timing(inputGlow, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  }, [inputGlow]);

  const envelopeTranslateY = envelopeFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const inputBorderColor = inputGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.6)'],
  });

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.successCard, { transform: [{ scale: successScale.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
          <View style={styles.successIconWrap}>
            <CheckCircle size={32} color="#2ECC71" />
          </View>
          <Text style={styles.successTitle}>You're In!</Text>
          <Text style={styles.successDesc}>We'll send you winning tips, jackpot alerts & exclusive picks.</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardGlow} />
        <View style={styles.headerRow}>
          <Animated.View style={[styles.iconWrap, { transform: [{ translateY: envelopeTranslateY }] }]}>
            <Mail size={24} color="#FFD700" />
          </Animated.View>
          <View style={styles.headerBadge}>
            <Sparkles size={10} color="#FFD700" />
            <Text style={styles.headerBadgeText}>FREE</Text>
          </View>
        </View>
        <Text style={styles.title}>Get Winning Edge Alerts</Text>
        <Text style={styles.subtitle}>Jackpot alerts, hot number tips & AI picks — straight to your inbox.</Text>

        <Animated.View style={[styles.inputWrap, { transform: [{ translateX: shakeAnimJS }], borderColor: inputBorderColor }]}>
          <Mail size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => { void handleSubmit(); }}
            testID="email-input"
          />
        </Animated.View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={() => { void handleSubmit(); }}
          activeOpacity={0.85}
          disabled={isSubmitting}
          testID="email-submit-btn"
        >
          <Send size={16} color="#0A0A0A" />
          <Text style={styles.submitBtnText}>{isSubmitting ? 'Subscribing...' : 'Subscribe Free'}</Text>
        </TouchableOpacity>

        <Text style={styles.privacyText}>No spam ever. Unsubscribe anytime.</Text>
      </View>
    </View>
  );
});

export default EmailCollector;

const styles = StyleSheet.create({
  container: {},
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  cardGlow: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255, 215, 0, 0.04)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#FFD700',
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFD700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 12,
    color: Colors.red,
    fontWeight: '600' as const,
    marginTop: -4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#0A0A0A',
  },
  privacyText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  successCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 204, 113, 0.3)',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  successIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(46, 204, 113, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(46, 204, 113, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#2ECC71',
  },
  successDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
