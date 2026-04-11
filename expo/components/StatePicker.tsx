import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { MapPin, ChevronDown, Search, X, Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { NATIONWIDE_STATES, StateConfig } from '@/config/states';

interface StatePickerProps {
  currentState: string;
  stateName: string;
  onSelect: (stateCode: string) => void;
}

const ALL_STATES = Object.values(NATIONWIDE_STATES).sort((a, b) =>
  a.name.localeCompare(b.name)
);

function StateItem({
  item,
  isSelected,
  onPress,
}: {
  item: StateConfig;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.stateItem, isSelected && styles.stateItemSelected]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`state-option-${item.code}`}
    >
      <View style={styles.stateItemLeft}>
        <Text style={styles.stateCode}>{item.code}</Text>
        <View style={styles.stateInfo}>
          <Text style={[styles.stateName, isSelected && styles.stateNameSelected]}>
            {item.name}
          </Text>
          <Text style={styles.stateGames}>{item.games.length} games</Text>
        </View>
      </View>
      {isSelected && <Check size={18} color={Colors.gold} />}
    </TouchableOpacity>
  );
}

const MemoStateItem = React.memo(StateItem);

export default React.memo(function StatePicker({
  currentState,
  stateName,
  onSelect,
}: StatePickerProps) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_STATES;
    const q = search.trim().toLowerCase();
    return ALL_STATES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleOpen = useCallback(() => {
    setSearch('');
    setVisible(true);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  const handleSelect = useCallback(
    (code: string) => {
      onSelect(code);
      setVisible(false);
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    [onSelect]
  );

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: StateConfig }) => (
      <MemoStateItem
        item={item}
        isSelected={item.code === currentState}
        onPress={() => handleSelect(item.code)}
      />
    ),
    [currentState, handleSelect]
  );

  const keyExtractor = useCallback((item: StateConfig) => item.code, []);

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={handleOpen}
        activeOpacity={0.7}
        testID="state-picker-trigger"
      >
        <MapPin size={14} color={Colors.gold} />
        <Text style={styles.triggerText}>{stateName}</Text>
        <ChevronDown size={14} color={Colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <View style={[styles.modalHeader, { paddingTop: Math.max(insets.top, 16) }]}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleClose}
                activeOpacity={0.7}
                testID="state-picker-close"
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchWrap}>
              <Search size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search states..."
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                testID="state-search-input"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
                  <X size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filtered}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No states found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignSelf: 'center',
  },
  triggerText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    padding: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 6,
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stateItemSelected: {
    borderColor: Colors.goldBorder,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
  },
  stateItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stateCode: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.gold,
    width: 28,
    textAlign: 'center',
  },
  stateInfo: {
    gap: 2,
  },
  stateName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  stateNameSelected: {
    color: Colors.gold,
  },
  stateGames: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  emptyWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
