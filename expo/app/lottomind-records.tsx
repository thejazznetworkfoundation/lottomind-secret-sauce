import React, { useCallback } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Radio, Sparkles, Ticket, X } from 'lucide-react-native';

import AppBackground from '@/components/AppBackground';
import { Colors } from '@/constants/colors';
import { RECORD_DROPS, type RecordDrop } from '@/constants/lottomindRecords';

export default function LottoMindRecordsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleRecordDrop = useCallback((drop: RecordDrop) => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }

    Alert.alert(
      drop.title,
      `Reserve this ${drop.format.toLowerCase()} for ${drop.priceCredits} credits. Checkout can be connected next.`
    );
  }, []);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => router.back()}
        activeOpacity={0.75}
        testID="records-close"
      >
        <X size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Radio size={14} color="#07101F" />
            <Text style={styles.heroBadgeText}>LottoMind Records</Text>
          </View>
          <Text style={styles.heroTitle}>Record drops, audio art, and branded music packs.</Text>
          <Text style={styles.heroBody}>
            A standalone Records area for featured songs, arcade soundtracks, and LottoMind audio releases.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Drops</Text>
          <Text style={styles.sectionHint}>No wallet balance here. Credit Vault lives in the arcade marketplace.</Text>
        </View>

        {RECORD_DROPS.map((drop) => (
          <TouchableOpacity
            key={drop.title}
            style={[styles.recordCard, { borderColor: `${drop.accent}40` }]}
            onPress={() => handleRecordDrop(drop)}
            activeOpacity={0.86}
            testID={`record-drop-${drop.title.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <View style={[styles.recordIconWrap, { backgroundColor: `${drop.accent}18`, borderColor: `${drop.accent}36` }]}>
              <Sparkles size={20} color={drop.accent} />
            </View>
            <View style={styles.recordInfo}>
              <Text style={[styles.recordFormat, { color: drop.accent }]}>{drop.format}</Text>
              <Text style={styles.recordTitle}>{drop.title}</Text>
              <Text style={styles.recordDetail}>{drop.detail}</Text>
              <View style={styles.recordTagRow}>
                {drop.tags.map((tag) => (
                  <View key={`${drop.title}-${tag}`} style={styles.recordTag}>
                    <Text style={styles.recordTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.recordPriceWrap}>
              <Ticket size={16} color={Colors.gold} />
              <Text style={styles.recordPrice}>{drop.priceCredits} cr</Text>
              <ChevronRight size={14} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: insets.bottom + 36 }} />
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    zIndex: 5,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 20, 43, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 96, 0.22)',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    borderRadius: 24,
    padding: 18,
    gap: 10,
    backgroundColor: 'rgba(8, 20, 43, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 96, 0.3)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.goldLight,
  },
  heroBadgeText: {
    color: '#07101F',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
  },
  heroBody: {
    color: '#9BB3C9',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  sectionHeader: {
    gap: 3,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  sectionHint: {
    color: '#8FA6BA',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(11, 14, 24, 0.96)',
    borderWidth: 1,
  },
  recordIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  recordInfo: {
    flex: 1,
    gap: 4,
  },
  recordFormat: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  recordTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  recordDetail: {
    color: '#9BB3C9',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  recordTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 3,
  },
  recordTag: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
    backgroundColor: 'rgba(230, 194, 96, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 96, 0.18)',
  },
  recordTagText: {
    color: Colors.goldLight,
    fontSize: 10,
    fontWeight: '900',
  },
  recordPriceWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minWidth: 66,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  recordPrice: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: '900',
  },
});
