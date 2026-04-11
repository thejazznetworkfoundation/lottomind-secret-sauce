import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';

const DISCLAIMER_KEY = 'lottomind_disclaimer_accepted_v2';

export default function LegalDisclaimer({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [agreed, setAgreed] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AsyncStorage.getItem(DISCLAIMER_KEY).then((val) => {
      if (val === 'true') {
        setAccepted(true);
      } else {
        setAccepted(false);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
      }
    }).catch(() => {
      setAccepted(false);
    });
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (accepted === false) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(btnPulse, { toValue: 1.04, duration: 800, useNativeDriver: true }),
          Animated.timing(btnPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [accepted, btnPulse]);

  const handleAccept = () => {
    if (!agreed) return;
    AsyncStorage.setItem(DISCLAIMER_KEY, 'true').catch(() => {});
    setAccepted(true);
  };

  if (accepted === null) {
    return <View style={styles.loadingContainer} />;
  }

  if (accepted) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Modal
        visible={!accepted}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headerBar} />
            <Text style={styles.logo}>LottoMind™</Text>
            <Text style={styles.tagline}>AI-Powered Lottery Intelligence</Text>

            <View style={styles.ageBox}>
              <Text style={styles.ageIcon}>🔞</Text>
              <Text style={styles.ageText}>You must be 18 years or older to use this app.</Text>
            </View>

            <View style={styles.divider} />

            <ScrollView
              style={styles.scrollArea}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.sectionTitle}>Legal Disclaimer</Text>

              <Text style={styles.disclaimerText}>
                LottoMind is an independent lottery-information tool/app and is not affiliated with or endorsed by any state lottery, MUSL, Powerball, or Mega Millions. No tickets are sold in-app. No winnings are guaranteed. All content is for informational and entertainment purposes only. Verify rules and results with the official lottery source in your jurisdiction.
              </Text>

              <View style={styles.responsibleBox}>
                <Text style={styles.responsibleTitle}>Play Responsibly</Text>
                <Text style={styles.responsibleText}>
                  If lottery play is causing financial or emotional harm, do not use this app for decision-making.
                </Text>
              </View>

              <Text style={styles.copyrightText}>
                © {new Date().getFullYear()} LottoMind™. All rights reserved.{'\n'}
                LottoMind™, Dream Oracle℠, and Sequence Engine℠ are proprietary marks.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.agreeRow}
              onPress={() => setAgreed(prev => !prev)}
              activeOpacity={0.7}
              testID="disclaimer-agree-checkbox"
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.agreeText}>I agree to the terms and disclaimer above</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: btnPulse }] }}>
              <TouchableOpacity
                style={[styles.acceptBtn, !agreed && styles.acceptBtnDisabled]}
                onPress={handleAccept}
                activeOpacity={agreed ? 0.85 : 1}
                testID="disclaimer-accept-btn"
                disabled={!agreed}
              >
                <Text style={[styles.acceptBtnText, !agreed && styles.acceptBtnTextDisabled]}>Click to Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: '#111111',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
  },
  headerBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(212, 175, 55, 0.4)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.gold,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  ageBox: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.35)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  ageIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  ageText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FF6B6B',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    marginVertical: 16,
  },
  scrollArea: {
    flex: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.gold,
    marginBottom: 8,
    marginTop: 4,
  },
  disclaimerText: {
    fontSize: 12.5,
    lineHeight: 19,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  responsibleBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    marginBottom: 8,
  },
  responsibleTitle: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.gold,
    marginBottom: 6,
  },
  responsibleText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  copyrightText: {
    fontSize: 11,
    lineHeight: 18,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.1)',
  },
  acceptBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  acceptBtnText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#1A1200',
    letterSpacing: 0.3,
  },
  acceptBtnDisabled: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  acceptBtnTextDisabled: {
    color: 'rgba(26, 18, 0, 0.4)',
  },
  agreeRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 14,
    paddingVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkboxChecked: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  agreeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    flex: 1,
  },
});
