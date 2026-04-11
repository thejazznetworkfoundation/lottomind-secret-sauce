import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Trash2, Flame, Snowflake, Scale, Brain, Database, Mail } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { GAME_CONFIGS } from '@/constants/games';
import { useLotto } from '@/providers/LottoProvider';

import EmailCollector from '@/components/EmailCollector';
import { GeneratedSet, StrategyType } from '@/types/lottery';

function getStrategyIcon(strategy: StrategyType) {
  switch (strategy) {
    case 'hot':
      return <Flame size={14} color={Colors.amber} />;
    case 'cold':
      return <Snowflake size={14} color={Colors.blue} />;
    case 'balanced':
      return <Scale size={14} color={Colors.green} />;
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { history, clearHistory } = useLotto();


  const renderItem = useCallback(({ item }: { item: GeneratedSet }) => {
    const config = GAME_CONFIGS[item.game];

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardInfo}>
            <View style={[styles.gameDot, { backgroundColor: config.color }]} />
            <Text style={styles.gameName}>{config.name}</Text>
            <View style={styles.strategyTag}>
              {getStrategyIcon(item.strategy)}
              <Text style={styles.strategyText}>
                {item.strategy.charAt(0).toUpperCase() + item.strategy.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.numbersRow}>
          {item.numbers.map((num) => (
            <View key={`${item.id}-${num}`} style={styles.numBall}>
              <Text style={styles.numText}>{num}</Text>
            </View>
          ))}
          <Text style={styles.plus}>+</Text>
          <View style={[styles.numBall, styles.bonusBall]}>
            <Text style={styles.bonusText}>{item.bonusNumber}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Brain size={14} color={Colors.gold} />
            <Text style={styles.metaPillText}>{item.prediction.confidence}% confidence</Text>
          </View>
          <View style={styles.metaPill}>
            <Database size={14} color={Colors.gold} />
            <Text style={styles.metaPillText}>
              {item.prediction.source === 'live-ml' ? 'Live ML blend' : 'Fallback model'}
            </Text>
          </View>
        </View>

        <View style={styles.reasonList}>
          {item.prediction.reasons.map((reason) => (
            <Text key={`${item.id}-${reason}`} style={styles.reasonText}>
              • {reason}
            </Text>
          ))}
        </View>
      </View>
    );
  }, []);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <Clock size={22} color={Colors.gold} />
        <Text style={styles.title}>Prediction History</Text>
        {history.length > 0 ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearHistory}
            activeOpacity={0.7}
            testID="clear-history"
          >
            <Trash2 size={16} color={Colors.red} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>



      <View style={styles.emailCollectorWrap}>
        <EmailCollector />
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Clock size={40} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No Predictions Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your saved live-model number sets will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.gold,
    flex: 1,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.redMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.red,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    flex: 1,
  },
  gameDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gameName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  strategyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  strategyText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  numbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  numBall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  numText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  bonusBall: {
    backgroundColor: Colors.redMuted,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  bonusText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.red,
  },
  plus: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  reasonList: {
    gap: 6,
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailCollectorWrap: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
});
