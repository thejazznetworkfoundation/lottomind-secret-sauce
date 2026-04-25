import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, ChevronLeft, Sparkles } from 'lucide-react-native';

import AppBackground from '@/components/AppBackground';
import { Colors } from '@/constants/colors';
import DailyFortuneDrop from '@/features/psychic/DailyFortuneDrop';
import { useSettings } from '@/providers/SettingsProvider';

export default function DailyFortuneScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPsychicEnabled } = useSettings();

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <CalendarDays size={22} color={Colors.gold} />
        <Text style={styles.headerTitle}>Daily Fortune Drop</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isPsychicEnabled ? (
          <View style={styles.card}>
            <Sparkles size={28} color="#8B5CF6" />
            <Text style={styles.cardTitle}>Daily Fortune is Off</Text>
            <Text style={styles.body}>Turn on AI Psychic Engine from Profile & Rewards to show fortune drops.</Text>
          </View>
        ) : (
          <DailyFortuneDrop />
        )}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900' as const,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
