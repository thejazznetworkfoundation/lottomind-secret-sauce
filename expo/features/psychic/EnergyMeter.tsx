import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { useSettings } from '@/providers/SettingsProvider';

export type EnergyMeterProps = {
  score: number;
  label?: string;
  compact?: boolean;
};

function getEnergyLabel(score: number) {
  if (score <= 39) return 'Cooling';
  if (score <= 69) return 'Neutral';
  return 'Rising';
}

export default function EnergyMeter({ score, label, compact = false }: EnergyMeterProps) {
  const { isPsychicEnabled } = useSettings();
  if (!isPsychicEnabled) return null;

  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const resolvedLabel = label ?? getEnergyLabel(safeScore);

  return (
    <View style={[styles.shell, compact && styles.shellCompact]}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{resolvedLabel}</Text>
        <Text style={styles.score}>{safeScore}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${safeScore}%` }]} />
      </View>
      {!compact ? <Text style={styles.note}>Energy Level</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 14,
    padding: 12,
    gap: 8,
    backgroundColor: 'rgba(109, 40, 217, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(109, 40, 217, 0.28)',
  },
  shellCompact: {
    padding: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '900' as const,
  },
  score: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '900' as const,
  },
  track: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#8B5CF6',
  },
  note: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
});
