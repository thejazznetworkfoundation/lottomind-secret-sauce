import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
  TextInput,
  Animated,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import MapView, { Marker, Region } from 'react-native-maps';
import {
  ChevronLeft,
  ChevronDown,
  MapPin,
  Navigation,
  Store,
  Phone,
  Clock,
  Star,
  Search,
  X,
  ExternalLink,
  Crosshair,
  Filter,
  Globe,
  Fuel,
  ShoppingCart,
  Wine,
  Pill,
  Cigarette,
  Newspaper,
  Bookmark,
  Trophy,
  PackageCheck,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import {
  ALL_LOTTERY_STORES,
  US_STATES,
  getStoresByState,
  getAvailableStates,
  getStateInfo,
  type LotteryStoreData,
} from '@/mocks/lottery-stores';
import { getStoreOpenStatus, getStatusColor } from '@/utils/storeStatus';
import {
  getFavoriteRetailerIds,
  getRetailerIntelligence,
  saveFavoriteRetailerIds,
} from '@/utils/retailerIntelligence';

const US_CENTER: Region = {
  latitude: 39.8283,
  longitude: -98.5795,
  latitudeDelta: 40,
  longitudeDelta: 40,
};

function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const STORE_TYPE_ICONS: Record<LotteryStoreData['type'], React.ReactNode> = {
  gas_station: <Fuel size={14} color={Colors.gold} />,
  convenience: <Store size={14} color={Colors.gold} />,
  grocery: <ShoppingCart size={14} color={Colors.gold} />,
  liquor: <Wine size={14} color={Colors.gold} />,
  pharmacy: <Pill size={14} color={Colors.gold} />,
  smoke_shop: <Cigarette size={14} color={Colors.gold} />,
  newsstand: <Newspaper size={14} color={Colors.gold} />,
};

const STORE_TYPE_LABELS: Record<LotteryStoreData['type'], string> = {
  gas_station: 'Gas Station',
  convenience: 'Convenience',
  grocery: 'Grocery',
  liquor: 'Liquor Store',
  pharmacy: 'Pharmacy',
  smoke_shop: 'Smoke Shop',
  newsstand: 'Newsstand',
};

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  return (
    <View style={starStyles.container}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          color={i < full || (i === full && hasHalf) ? Colors.gold : Colors.textMuted}
          fill={i < full ? Colors.gold : 'transparent'}
        />
      ))}
      <Text style={starStyles.text}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const starStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  text: { fontSize: 11, fontWeight: '700' as const, color: Colors.gold, marginLeft: 3 },
});

function StatePicker({
  selectedState,
  onSelect,
  visible,
  onClose,
}: {
  selectedState: string | null;
  onSelect: (code: string | null) => void;
  visible: boolean;
  onClose: () => void;
}) {
  const availableCodes = useMemo(() => getAvailableStates(), []);
  const availableStates = useMemo(
    () =>
      US_STATES.filter((s) => availableCodes.includes(s.code)).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    [availableCodes]
  );

  if (!visible) return null;

  return (
    <View style={pickerStyles.overlay}>
      <View style={pickerStyles.container}>
        <View style={pickerStyles.header}>
          <Globe size={18} color={Colors.gold} />
          <Text style={pickerStyles.title}>Select State</Text>
          <TouchableOpacity onPress={onClose} style={pickerStyles.closeBtn}>
            <X size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[pickerStyles.stateItem, !selectedState && pickerStyles.stateItemActive]}
          onPress={() => {
            onSelect(null);
            onClose();
          }}
          activeOpacity={0.7}
        >
          <Globe size={16} color={!selectedState ? Colors.gold : Colors.textMuted} />
          <Text
            style={[
              pickerStyles.stateName,
              !selectedState && pickerStyles.stateNameActive,
            ]}
          >
            All States ({ALL_LOTTERY_STORES.length} stores)
          </Text>
        </TouchableOpacity>

        <ScrollView
          style={pickerStyles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {availableStates.map((st) => {
            const count = getStoresByState(st.code).length;
            const isActive = selectedState === st.code;
            return (
              <TouchableOpacity
                key={st.code}
                style={[pickerStyles.stateItem, isActive && pickerStyles.stateItemActive]}
                onPress={() => {
                  onSelect(st.code);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <MapPin size={14} color={isActive ? Colors.gold : Colors.textMuted} />
                <Text
                  style={[
                    pickerStyles.stateName,
                    isActive && pickerStyles.stateNameActive,
                  ]}
                >
                  {st.name}
                </Text>
                <View style={pickerStyles.countBadge}>
                  <Text style={pickerStyles.countText}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    width: '100%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    maxHeight: 400,
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42,42,42,0.5)',
  },
  stateItemActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  stateName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  stateNameActive: {
    color: Colors.gold,
    fontWeight: '700' as const,
  },
  countBadge: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
});

export default function StoreLocatorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<LotteryStoreData | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>(US_CENTER);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [showStatePicker, setShowStatePicker] = useState<boolean>(false);
  const [storeTypeFilter, setStoreTypeFilter] = useState<LotteryStoreData['type'] | null>(null);
  const [openNowFilter, setOpenNowFilter] = useState<boolean>(false);
  const [favoritesOnlyFilter, setFavoritesOnlyFilter] = useState<boolean>(false);
  const [favoriteStoreIds, setFavoriteStoreIds] = useState<string[]>([]);
  const selectedAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;

    getFavoriteRetailerIds()
      .then((ids) => {
        if (mounted) {
          setFavoriteStoreIds(ids);
        }
      })
      .catch((error) => console.log('[StoreLocator] Favorite load error', error));

    return () => {
      mounted = false;
    };
  }, []);

  const baseStores = useMemo(() => {
    if (selectedState) {
      return getStoresByState(selectedState);
    }
    return ALL_LOTTERY_STORES;
  }, [selectedState]);

  const storesWithDistance = useMemo(() => {
    let stores = baseStores;
    if (storeTypeFilter) {
      stores = stores.filter((s) => s.type === storeTypeFilter);
    }
    if (openNowFilter) {
      stores = stores.filter((s) => getStoreOpenStatus(s.hours).isOpen);
    }
    if (favoritesOnlyFilter) {
      stores = stores.filter((s) => favoriteStoreIds.includes(s.id));
    }
    const storesWithMiles = stores.map((store) => {
      if (!userLocation) return { ...store, distance: '--' };
      const dist = getDistanceMiles(userLocation.lat, userLocation.lng, store.lat, store.lng);
      return { ...store, distance: `${dist.toFixed(1)} mi` };
    });

    return storesWithMiles.sort((a, b) => {
      const favoriteRank =
        Number(favoriteStoreIds.includes(b.id)) - Number(favoriteStoreIds.includes(a.id));
      if (favoriteRank !== 0) return favoriteRank;
      if (userLocation) return parseFloat(a.distance) - parseFloat(b.distance);
      return getRetailerIntelligence(b).retailerScore - getRetailerIntelligence(a).retailerScore;
    });
  }, [userLocation, baseStores, storeTypeFilter, openNowFilter, favoritesOnlyFilter, favoriteStoreIds]);

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return storesWithDistance;
    const q = searchQuery.toLowerCase();
    return storesWithDistance.filter(
      (s) => {
        const intelligence = getRetailerIntelligence(s);
        return (
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.state.toLowerCase().includes(q) ||
          s.stateCode.toLowerCase().includes(q) ||
          s.games.some((g) => g.toLowerCase().includes(q)) ||
          intelligence.scratcherStockConfidence.toLowerCase().includes(q) ||
          intelligence.scratchersLikelyInStock.some((item) => item.toLowerCase().includes(q)) ||
          intelligence.bestFor.some((item) => item.toLowerCase().includes(q)) ||
          (favoriteStoreIds.includes(s.id) && 'favorite saved'.includes(q))
        );
      }
    );
  }, [searchQuery, storesWithDistance, favoriteStoreIds]);

  const retailerHighlights = useMemo(() => {
    const enriched = filteredStores.map((store) => ({
      store,
      intelligence: getRetailerIntelligence(store),
    }));
    const sortedByScore = [...enriched].sort(
      (a, b) => b.intelligence.retailerScore - a.intelligence.retailerScore
    );
    const topPrize = sortedByScore.find((item) => item.intelligence.topPrizeSellerSignal) ?? sortedByScore[0];
    const highStockCount = enriched.filter(
      (item) => item.intelligence.scratcherStockConfidence === 'High'
    ).length;

    return {
      topPrize,
      highStockCount,
      favoriteCount: favoriteStoreIds.length,
    };
  }, [filteredStores, favoriteStoreIds.length]);

  useEffect(() => {
    if (selectedStore) {
      Animated.spring(selectedAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      selectedAnim.setValue(0);
    }
  }, [selectedStore, selectedAnim]);

  const handleStateSelect = useCallback(
    (code: string | null) => {
      setSelectedState(code);
      setSelectedStore(null);
      if (code) {
        const stateInfo = getStateInfo(code);
        if (stateInfo) {
          const region: Region = {
            latitude: stateInfo.lat,
            longitude: stateInfo.lng,
            latitudeDelta: 5,
            longitudeDelta: 5,
          };
          setMapRegion(region);
          if (mapRef.current) {
            mapRef.current.animateToRegion(region, 600);
          }
        }
      } else {
        setMapRegion(US_CENTER);
        if (mapRef.current) {
          mapRef.current.animateToRegion(US_CENTER, 600);
        }
      }
    },
    []
  );

  const handleGetDirections = useCallback((store: LotteryStoreData) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${store.lat},${store.lng}`,
      android: `google.navigation:q=${store.lat},${store.lng}`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`,
    });
    if (url) {
      void Linking.openURL(url).catch(() => {
        const fallback = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
        void Linking.openURL(fallback);
      });
    }
  }, []);

  const handleCall = useCallback((phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (Platform.OS === 'web') {
      Alert.alert('Phone', phone);
      return;
    }
    void Linking.openURL(`tel:${cleaned}`).catch(() => {
      Alert.alert('Unable to make call', phone);
    });
  }, []);

  const handleToggleFavorite = useCallback((storeId: string) => {
    setFavoriteStoreIds((prev) => {
      const next = prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [storeId, ...prev];
      void saveFavoriteRetailerIds(next);
      return next;
    });
  }, []);

  const handleSelectStore = useCallback(
    (store: LotteryStoreData & { distance: string }) => {
      setSelectedStore(store);
      const region: Region = {
        latitude: store.lat,
        longitude: store.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setMapRegion(region);
      if (mapRef.current) {
        mapRef.current.animateToRegion(region, 500);
      }
    },
    []
  );

  const handleLocateMe = useCallback(() => {
    setIsLocating(true);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('[StoreLocator] Web location:', latitude, longitude);
          setUserLocation({ lat: latitude, lng: longitude });
          const region: Region = {
            latitude,
            longitude,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          };
          setMapRegion(region);
          if (mapRef.current) {
            mapRef.current.animateToRegion(region, 500);
          }
          setIsLocating(false);
          setSelectedState(null);
          Alert.alert('Location Found', 'Showing lottery retailers sorted by distance.');
        },
        (err) => {
          console.log('[StoreLocator] Web location error:', err);
          setIsLocating(false);
          Alert.alert('Location Error', 'Could not get your location. Please allow location access.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      (async () => {
        try {
          const Location = await import('expo-location');
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setIsLocating(false);
            Alert.alert('Permission Denied', 'Please enable location permissions.');
            return;
          }
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          console.log('[StoreLocator] Native location:', loc.coords.latitude, loc.coords.longitude);
          setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          const region: Region = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          };
          setMapRegion(region);
          if (mapRef.current) {
            mapRef.current.animateToRegion(region, 500);
          }
          setIsLocating(false);
          setSelectedState(null);
          Alert.alert('Location Found', 'Showing lottery retailers sorted by distance.');
        } catch (e) {
          console.log('[StoreLocator] Native location error:', e);
          setIsLocating(false);
          Alert.alert('Location Error', 'Could not determine your location.');
        }
      })();
    }
  }, []);

  const selectedStateName = useMemo(() => {
    if (!selectedState) return 'All US States';
    return US_STATES.find((s) => s.code === selectedState)?.name ?? selectedState;
  }, [selectedState]);

  const storeTypeOptions: (LotteryStoreData['type'] | null)[] = [
    null,
    'gas_station',
    'convenience',
    'grocery',
    'liquor',
    'pharmacy',
    'smoke_shop',
    'newsstand',
  ];

  const selectedIntelligence = selectedStore ? getRetailerIntelligence(selectedStore) : null;
  const selectedIsFavorite = selectedStore ? favoriteStoreIds.includes(selectedStore.id) : false;

  const renderStoreCard = useCallback(
    ({ item }: { item: LotteryStoreData & { distance: string } }) => {
      const isSelected = selectedStore?.id === item.id;
      const isFavorite = favoriteStoreIds.includes(item.id);
      const status = getStoreOpenStatus(item.hours);
      const statusColor = getStatusColor(status.urgency);
      const intelligence = getRetailerIntelligence(item);
      return (
        <TouchableOpacity
          style={[styles.storeCard, isSelected && styles.storeCardSelected]}
          onPress={() => handleSelectStore(item)}
          activeOpacity={0.7}
        >
          <View style={styles.storeTop}>
            <View style={styles.storeIconWrap}>
              {STORE_TYPE_ICONS[item.type] ?? <Store size={18} color={Colors.gold} />}
            </View>
            <View style={styles.storeInfo}>
              <View style={styles.storeNameRow}>
                <Text style={styles.storeName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.storeDistance}>{item.distance}</Text>
              </View>
              <Text style={styles.storeAddress} numberOfLines={1}>
                {item.address}, {item.city}, {item.stateCode} {item.zip}
              </Text>
              <View style={styles.storeMetaRow}>
                <StarRating rating={item.rating} />
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: `${statusColor}30` }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusText, { color: statusColor }]}>{status.label}</Text>
                </View>
              </View>
              <View style={styles.intelligenceRow}>
                {isFavorite && (
                  <View style={styles.signalPill}>
                    <Bookmark size={10} color={Colors.gold} fill={Colors.gold} />
                    <Text style={styles.signalText}>Saved</Text>
                  </View>
                )}
                {intelligence.topPrizeSellerSignal && (
                  <View style={styles.signalPill}>
                    <Trophy size={10} color={Colors.gold} />
                    <Text style={styles.signalText}>Top-prize seller nearby</Text>
                  </View>
                )}
                <View style={styles.signalPillMuted}>
                  <PackageCheck size={10} color="#00E676" />
                  <Text style={styles.signalTextMuted}>
                    {intelligence.scratcherStockConfidence} stock signal
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.stockPanel}>
            <Text style={styles.stockTitle}>Likely scratchers in stock</Text>
            <Text style={styles.stockText}>{intelligence.scratchersLikelyInStock.join(' / ')}</Text>
            <Text style={styles.stockNoteText}>{intelligence.bestFor.join(' | ')}</Text>
          </View>

          <View style={styles.storeGames}>
            {item.games.slice(0, 4).map((game) => (
              <View key={`${item.id}-${game}`} style={styles.gameTag}>
                <Text style={styles.gameTagText}>{game}</Text>
              </View>
            ))}
            {item.games.length > 4 && (
              <View style={styles.gameTag}>
                <Text style={styles.gameTagText}>+{item.games.length - 4}</Text>
              </View>
            )}
          </View>

          <View style={styles.storeActions}>
            <TouchableOpacity
              style={[styles.storeActionBtn, isFavorite && styles.favoriteActionActive]}
              onPress={() => handleToggleFavorite(item.id)}
            >
              <Bookmark size={13} color={isFavorite ? '#0A0A0A' : Colors.gold} fill={isFavorite ? '#0A0A0A' : 'transparent'} />
              <Text style={[styles.storeActionText, isFavorite && styles.favoriteActionText]}>
                {isFavorite ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.storeActionBtn}
              onPress={() => handleGetDirections(item)}
            >
              <Navigation size={13} color="#00E676" />
              <Text style={styles.storeActionText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.storeActionBtn}
              onPress={() => handleCall(item.phone)}
            >
              <Phone size={13} color={Colors.gold} />
              <Text style={styles.storeActionText}>{item.phone}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [selectedStore, favoriteStoreIds, handleSelectStore, handleToggleFavorite, handleGetDirections, handleCall]
  );

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="store-locator-back">
          <ChevronLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <MapPin size={18} color={Colors.gold} />
        <Text style={styles.headerTitle}>Retailer Intelligence</Text>
        <TouchableOpacity
          style={styles.locateBtn}
          onPress={handleLocateMe}
          disabled={isLocating}
          activeOpacity={0.7}
          testID="locate-me-btn"
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={Colors.gold} />
          ) : (
            <Crosshair size={17} color={Colors.gold} />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.stateSelector}
        onPress={() => setShowStatePicker(true)}
        activeOpacity={0.7}
        testID="state-picker-btn"
      >
        <Globe size={16} color={Colors.gold} />
        <Text style={styles.stateSelectorText}>{selectedStateName}</Text>
        <View style={styles.stateSelectorCount}>
          <Text style={styles.stateSelectorCountText}>{filteredStores.length}</Text>
        </View>
        <ChevronDown size={16} color={Colors.textMuted} />
      </TouchableOpacity>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores, cities, games..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            testID="store-search-input"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeFilterScroll}
        contentContainerStyle={styles.typeFilterContent}
      >
        <TouchableOpacity
          style={[styles.typeChip, openNowFilter && styles.openNowChipActive]}
          onPress={() => setOpenNowFilter(prev => !prev)}
          activeOpacity={0.7}
        >
          <Clock size={12} color={openNowFilter ? '#0A0A0A' : '#00E676'} />
          <Text style={[styles.typeChipText, openNowFilter && styles.openNowChipTextActive]}>Open Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeChip, favoritesOnlyFilter && styles.favoriteChipActive]}
          onPress={() => setFavoritesOnlyFilter(prev => !prev)}
          activeOpacity={0.7}
        >
          <Bookmark
            size={12}
            color={favoritesOnlyFilter ? '#0A0A0A' : Colors.gold}
            fill={favoritesOnlyFilter ? '#0A0A0A' : 'transparent'}
          />
          <Text style={[styles.typeChipText, favoritesOnlyFilter && styles.favoriteChipTextActive]}>
            Favorites
          </Text>
        </TouchableOpacity>
        {storeTypeOptions.map((type) => {
          const isActive = storeTypeFilter === type;
          return (
            <TouchableOpacity
              key={type ?? 'all'}
              style={[styles.typeChip, isActive && styles.typeChipActive]}
              onPress={() => setStoreTypeFilter(type)}
              activeOpacity={0.7}
            >
              {type === null ? (
                <Filter size={12} color={isActive ? Colors.background : Colors.textMuted} />
              ) : (
                STORE_TYPE_ICONS[type]
              )}
              <Text
                style={[styles.typeChipText, isActive && styles.typeChipTextActive]}
              >
                {type === null ? 'All' : STORE_TYPE_LABELS[type]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.intelligenceCard}>
        <View style={styles.intelligenceHeader}>
          <View>
            <Text style={styles.intelligenceTitle}>Retailer Intelligence</Text>
            <Text style={styles.intelligenceSubtitle}>
              Favorites, route-ready stops, scratcher stock signals, and top-prize seller clues.
            </Text>
          </View>
          <Trophy size={20} color={Colors.gold} />
        </View>

        <View style={styles.intelligenceGrid}>
          <View style={styles.intelligenceMetric}>
            <Text style={styles.intelligenceMetricValue}>{retailerHighlights.favoriteCount}</Text>
            <Text style={styles.intelligenceMetricLabel}>Favorites</Text>
          </View>
          <View style={styles.intelligenceMetric}>
            <Text style={styles.intelligenceMetricValue}>{retailerHighlights.highStockCount}</Text>
            <Text style={styles.intelligenceMetricLabel}>High stock</Text>
          </View>
          <View style={styles.intelligenceMetricWide}>
            <Text style={styles.insightTitle}>Top nearby signal</Text>
            <Text style={styles.insightBody} numberOfLines={2}>
              {retailerHighlights.topPrize
                ? `${retailerHighlights.topPrize.store.name} - ${retailerHighlights.topPrize.intelligence.retailerScore}/100`
                : 'Pick a state or location to surface a top retailer signal.'}
            </Text>
          </View>
        </View>

        <Text style={styles.safetyNote}>
          Inventory and seller signals are informational estimates. Confirm scratcher stock and services before you go.
        </Text>
      </View>

      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <View style={styles.webMapFallback}>
            <View style={styles.webMapHeader}>
              <MapPin size={16} color={Colors.gold} />
              <Text style={styles.webMapTitle}>
                {selectedStateName} — {filteredStores.length} retailers
              </Text>
            </View>
            <ScrollView
              style={styles.webMapScroll}
              contentContainerStyle={styles.webMapGrid}
              showsVerticalScrollIndicator={false}
            >
              {filteredStores.slice(0, 12).map((store) => (
                <TouchableOpacity
                  key={store.id}
                  style={[
                    styles.webMapPin,
                    selectedStore?.id === store.id && styles.webMapPinSelected,
                  ]}
                  onPress={() => handleSelectStore(store)}
                  activeOpacity={0.7}
                >
                  <MapPin
                    size={12}
                    color={selectedStore?.id === store.id ? '#00E676' : Colors.gold}
                  />
                  <Text style={styles.webMapPinName} numberOfLines={1}>
                    {store.name}
                  </Text>
                  <Text style={styles.webMapPinCity} numberOfLines={1}>
                    {store.city}, {store.stateCode}
                  </Text>
                  {store.distance !== '--' && (
                    <Text style={styles.webMapPinDist}>{store.distance}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={US_CENTER}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
            >
              {filteredStores.map((store) => (
                <Marker
                  key={store.id}
                  coordinate={{ latitude: store.lat, longitude: store.lng }}
                  title={store.name}
                  description={`${store.address}, ${store.city}, ${store.stateCode}`}
                  onPress={() => handleSelectStore(store)}
                  pinColor={selectedStore?.id === store.id ? '#00E676' : Colors.gold}
                />
              ))}
              {userLocation && (
                <Marker
                  coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
                  title="You are here"
                  pinColor="#3498DB"
                />
              )}
            </MapView>
            <View style={styles.mapBadge}>
              <MapPin size={11} color={Colors.gold} />
              <Text style={styles.mapBadgeText}>{filteredStores.length} stores</Text>
            </View>
          </>
        )}
      </View>

      {selectedStore && (
        <Animated.View
          style={[
            styles.selectedCard,
            {
              opacity: selectedAnim,
              transform: [
                {
                  translateY: selectedAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.selectedTop}>
            <View style={styles.selectedIconWrap}>
              {STORE_TYPE_ICONS[selectedStore.type] ?? <Store size={18} color={Colors.gold} />}
            </View>
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedName}>{selectedStore.name}</Text>
              <Text style={styles.selectedAddress}>
                {selectedStore.address}, {selectedStore.city}, {selectedStore.stateCode}{' '}
                {selectedStore.zip}
              </Text>
              <View style={styles.selectedMeta}>
                <StarRating rating={selectedStore.rating} />
                {'distance' in selectedStore && (
                  <Text style={styles.selectedDist}>
                    {(selectedStore as LotteryStoreData & { distance: string }).distance}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={() => setSelectedStore(null)} style={styles.closeBtn}>
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.selectedGames}>
            {selectedStore.games.map((g) => (
              <View key={g} style={styles.selectedGameTag}>
                <Text style={styles.selectedGameText}>{g}</Text>
              </View>
            ))}
          </View>
          {selectedIntelligence && (
            <View style={styles.selectedIntelPanel}>
              <View style={styles.intelligenceRow}>
                {selectedIntelligence.topPrizeSellerSignal && (
                  <View style={styles.signalPill}>
                    <Trophy size={10} color={Colors.gold} />
                    <Text style={styles.signalText}>Top-prize seller nearby</Text>
                  </View>
                )}
                <View style={styles.signalPillMuted}>
                  <PackageCheck size={10} color="#00E676" />
                  <Text style={styles.signalTextMuted}>
                    {selectedIntelligence.scratcherStockConfidence} stock signal
                  </Text>
                </View>
              </View>
              <Text style={styles.stockText}>
                Likely in stock: {selectedIntelligence.scratchersLikelyInStock.join(' / ')}
              </Text>
              <Text style={styles.stockNoteText}>{selectedIntelligence.routeHint}</Text>
            </View>
          )}
          <View style={styles.selectedActions}>
            <TouchableOpacity
              style={[styles.actionBtn, selectedIsFavorite && styles.favoriteActionActive]}
              onPress={() => handleToggleFavorite(selectedStore.id)}
            >
              <Bookmark
                size={14}
                color={selectedIsFavorite ? '#0A0A0A' : Colors.gold}
                fill={selectedIsFavorite ? '#0A0A0A' : 'transparent'}
              />
              <Text style={[styles.actionBtnText, selectedIsFavorite && styles.favoriteActionText]}>
                {selectedIsFavorite ? 'Saved' : 'Favorite'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleGetDirections(selectedStore)}
            >
              <Navigation size={14} color="#00E676" />
              <Text style={styles.actionBtnText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleCall(selectedStore.phone)}
            >
              <Phone size={14} color={Colors.gold} />
              <Text style={styles.actionBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.resultCount}>
          {filteredStores.length} lottery retailer{filteredStores.length !== 1 ? 's' : ''}
          {selectedState ? ` in ${selectedStateName}` : ' across the US'}
        </Text>
      </View>

      <FlatList
        data={filteredStores}
        keyExtractor={(item) => item.id}
        renderItem={renderStoreCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MapPin size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No stores found</Text>
            <Text style={styles.emptySubtitle}>Try a different search or state filter</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.findMoreBtn}
              onPress={() => {
                const url = 'https://www.google.com/maps/search/lottery+retailer+near+me';
                void Linking.openURL(url);
              }}
              activeOpacity={0.7}
            >
              <ExternalLink size={15} color={Colors.gold} />
              <Text style={styles.findMoreText}>Find More on Google Maps</Text>
            </TouchableOpacity>
            <View style={{ height: insets.bottom + 20 }} />
          </View>
        }
      />

      <StatePicker
        selectedState={selectedState}
        onSelect={handleStateSelect}
        visible={showStatePicker}
        onClose={() => setShowStatePicker(false)}
      />
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
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.gold,
    flex: 1,
  },
  locateBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  stateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  stateSelectorText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  stateSelectorCount: {
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  stateSelectorCountText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    height: 42,
  },
  typeFilterScroll: {
    maxHeight: 44,
    marginTop: 10,
  },
  typeFilterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  typeChipTextActive: {
    color: Colors.background,
    fontWeight: '700' as const,
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: {
    flex: 1,
  },
  webMapFallback: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  webMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  webMapTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  webMapScroll: {
    flex: 1,
  },
  webMapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 8,
  },
  webMapPin: {
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 2,
    width: '23%' as unknown as number,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
  },
  webMapPinSelected: {
    borderColor: 'rgba(0, 230, 118, 0.4)',
    backgroundColor: 'rgba(0, 230, 118, 0.06)',
  },
  webMapPinName: {
    fontSize: 8,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
  },
  webMapPinCity: {
    fontSize: 8,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  webMapPinDist: {
    fontSize: 8,
    fontWeight: '600' as const,
    color: '#00E676',
  },
  mapBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  mapBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  selectedCard: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  selectedTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  selectedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  selectedInfo: {
    flex: 1,
    gap: 2,
  },
  selectedName: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  selectedAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  selectedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 3,
  },
  selectedDist: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#00E676',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedGames: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  selectedGameTag: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedGameText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  selectedActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 10,
  },
  storeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  storeCardSelected: {
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  storeTop: {
    flexDirection: 'row',
    gap: 10,
  },
  storeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  storeInfo: {
    flex: 1,
    gap: 3,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  storeDistance: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#00E676',
  },
  storeAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  openNowChipActive: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  openNowChipTextActive: {
    color: '#0A0A0A',
    fontWeight: '700' as const,
  },
  favoriteChipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  favoriteChipTextActive: {
    color: '#0A0A0A',
    fontWeight: '700' as const,
  },
  intelligenceCard: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 14, 30, 0.92)',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    gap: 12,
  },
  intelligenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  intelligenceTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  intelligenceSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginTop: 3,
  },
  intelligenceGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  intelligenceMetric: {
    width: 76,
    borderRadius: 12,
    padding: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  intelligenceMetricWide: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  intelligenceMetricValue: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: Colors.gold,
  },
  intelligenceMetricLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    marginTop: 2,
  },
  insightTitle: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  },
  insightBody: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    lineHeight: 17,
    marginTop: 4,
  },
  safetyNote: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  storeGames: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  gameTag: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gameTagText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  storeActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  storeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  storeActionText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  favoriteActionActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  favoriteActionText: {
    color: '#0A0A0A',
    fontWeight: '800' as const,
  },
  intelligenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 5,
  },
  signalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  signalPillMuted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.18)',
  },
  signalText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  signalTextMuted: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#00E676',
  },
  stockPanel: {
    borderRadius: 12,
    padding: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    gap: 3,
  },
  selectedIntelPanel: {
    borderRadius: 12,
    padding: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    gap: 5,
  },
  stockTitle: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.gold,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.35,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  stockNoteText: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  footer: {
    paddingTop: 10,
  },
  findMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  findMoreText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
});
