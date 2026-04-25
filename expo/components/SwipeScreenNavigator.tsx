import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

const EDGE_ZONE = 88;
const TAB_BAR_SAFE_ZONE = 118;
const SWIPE_VELOCITY = 0.38;
const SWIPE_OUT_MS = 160;
const SWIPE_IN_MS = 210;

const SWIPE_ROUTES = [
  { path: '/', label: 'Dashboard' },
  { path: '/powertools', label: 'Power Tools' },
  { path: '/heatmap', label: 'Heatmap' },
  { path: '/dreams', label: 'Dreams' },
  { path: '/sequence', label: 'Sequence' },
  { path: '/history', label: 'History' },
  { path: '/chat', label: 'AI Chat' },
  { path: '/games', label: 'Games' },
  { path: '/tools', label: 'Tools' },
  { path: '/wallet', label: 'Wallet' },
  { path: '/more', label: 'More' },
  { path: '/arcade', label: 'Arcade' },
  { path: '/games-hub', label: 'Games Hub' },
  { path: '/trivia-rewards', label: 'Rewards' },
  { path: '/trivia-play', label: 'Trivia Play' },
  { path: '/trivia-redeem', label: 'Redeem' },
  { path: '/credit-store', label: 'Credit Vault' },
  { path: '/credits-wallet', label: 'Credits' },
  { path: '/saved-wallet', label: 'Saved Wallet' },
  { path: '/scanner', label: 'Scanner' },
  { path: '/ticket-scanner', label: 'Ticket Scanner' },
  { path: '/live-data', label: 'Live Data' },
  { path: '/live-results', label: 'Live Results' },
  { path: '/intelligence', label: 'Intelligence' },
  { path: '/lotto-intelligence', label: 'Lotto Intel' },
  { path: '/heatmap-analytics', label: 'Heat Analytics' },
  { path: '/pick-games', label: 'Pick Games' },
  { path: '/store-locator', label: 'Stores' },
  { path: '/horoscope', label: 'Horoscope' },
  { path: '/dream-oracle', label: 'Dream Oracle' },
  { path: '/lottomind-ai', label: 'AI Picks' },
  { path: '/number-generator', label: 'Generator' },
  { path: '/psychic', label: 'Psychic' },
  { path: '/future-read', label: 'Future Read' },
  { path: '/daily-fortune', label: 'Fortune' },
  { path: '/daily-tools', label: 'Daily Tools' },
  { path: '/energy-meter', label: 'Energy' },
  { path: '/luck-profile', label: 'Luck Profile' },
  { path: '/nationwide-analysis', label: 'Nationwide' },
  { path: '/detailed-report', label: 'Report' },
  { path: '/name-numbers', label: 'Name Numbers' },
  { path: '/us-lottery', label: 'US Lottery' },
  { path: '/lucky-weather', label: 'Weather' },
  { path: '/crossword', label: 'Crossword' },
  { path: '/word-search', label: 'Word Search' },
  { path: '/ludo', label: 'Ludo' },
  { path: '/card-game', label: 'Memory' },
  { path: '/shop', label: 'Shop' },
  { path: '/profile', label: 'Profile' },
  { path: '/settings', label: 'Settings' },
  { path: '/vip', label: 'VIP' },
  { path: '/paywall', label: 'Pro' },
  { path: '/achievements', label: 'Achievements' },
  { path: '/community', label: 'Community' },
  { path: '/contests', label: 'Contests' },
  { path: '/history-ui', label: 'History UI' },
  { path: '/lottomind-historical', label: 'Historical' },
  { path: '/lottomind-records', label: 'Records' },
  { path: '/notifications', label: 'Notifications' },
  { path: '/onboarding', label: 'Onboarding' },
  { path: '/splash', label: 'Splash' },
  { path: '/thank-you', label: 'Thank You' },
  { path: '/viral-studio', label: 'Viral Studio' },
  { path: '/help', label: 'Help' },
] as const;

function normalizePath(pathname: string) {
  if (!pathname || pathname === '/index') {
    return '/';
  }
  const cleaned = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  return cleaned === '/(tabs)' ? '/' : cleaned;
}

interface SwipeScreenNavigatorProps {
  children: React.ReactNode;
}

export default function SwipeScreenNavigator({ children }: SwipeScreenNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width, height } = useWindowDimensions();
  const translateX = useRef(new Animated.Value(0)).current;
  const previousPathRef = useRef<string | null>(null);
  const previousRouteIndexRef = useRef<number>(-1);
  const entranceDirectionRef = useRef<number>(0);
  const isAnimatingRef = useRef(false);
  const normalizedPath = normalizePath(pathname);
  const routeIndex = SWIPE_ROUTES.findIndex((route) => route.path === normalizedPath);
  const maxDrag = Math.max(96, Math.min(width * 0.38, 168));
  const swipeDistance = Math.max(78, Math.min(width * 0.24, 112));
  const previousRoute = routeIndex >= 0 ? SWIPE_ROUTES[(routeIndex - 1 + SWIPE_ROUTES.length) % SWIPE_ROUTES.length] : null;
  const nextRoute = routeIndex >= 0 ? SWIPE_ROUTES[(routeIndex + 1) % SWIPE_ROUTES.length] : null;

  useEffect(() => {
    const previousPath = previousPathRef.current;
    const previousRouteIndex = previousRouteIndexRef.current;

    if (previousPath === null) {
      previousPathRef.current = normalizedPath;
      previousRouteIndexRef.current = routeIndex;
      return;
    }

    if (previousPath === normalizedPath) {
      return;
    }

    previousPathRef.current = normalizedPath;
    previousRouteIndexRef.current = routeIndex;

    if (routeIndex < 0) {
      translateX.setValue(0);
      isAnimatingRef.current = false;
      return;
    }

    const inferredDirection =
      entranceDirectionRef.current ||
      (previousRouteIndex >= 0 && routeIndex > previousRouteIndex ? 1 : -1);
    entranceDirectionRef.current = 0;
    translateX.setValue(inferredDirection * width);
    isAnimatingRef.current = true;

    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      speed: 18,
      bounciness: 3,
    }).start(() => {
      isAnimatingRef.current = false;
    });
  }, [normalizedPath, routeIndex, translateX, width]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (event, gestureState) => {
          if (routeIndex < 0 || isAnimatingRef.current) {
            return false;
          }

          const startX = event.nativeEvent.pageX;
          const startY = event.nativeEvent.pageY;
          const fromEdge = startX <= EDGE_ZONE || startX >= width - EDGE_ZONE;
          const nearTabBar = startY >= height - TAB_BAR_SAFE_ZONE;
          const horizontal = Math.abs(gestureState.dx) > 24 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.45;
          const strongFullScreenSwipe =
            !nearTabBar &&
            Math.abs(gestureState.dx) > 42 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2.1;

          return horizontal && (fromEdge || strongFullScreenSwipe);
        },
        onPanResponderMove: (_, gestureState) => {
          const clampedDrag = Math.max(-maxDrag, Math.min(maxDrag, gestureState.dx));
          translateX.setValue(clampedDrag);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (routeIndex < 0) {
            translateX.setValue(0);
            return;
          }

          const shouldNavigate = Math.abs(gestureState.dx) >= swipeDistance || Math.abs(gestureState.vx) >= SWIPE_VELOCITY;
          if (!shouldNavigate) {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              speed: 20,
              bounciness: 5,
            }).start();
            return;
          }

          const direction = gestureState.dx < 0 ? 1 : -1;
          const nextIndex = (routeIndex + direction + SWIPE_ROUTES.length) % SWIPE_ROUTES.length;
          const targetRoute = SWIPE_ROUTES[nextIndex].path;

          if (targetRoute !== normalizedPath) {
            isAnimatingRef.current = true;
            entranceDirectionRef.current = direction;
            Animated.timing(translateX, {
              toValue: -direction * width,
              duration: SWIPE_OUT_MS,
              useNativeDriver: true,
            }).start(() => {
              router.replace(targetRoute as never);
            });
            return;
          }

          Animated.timing(translateX, {
            toValue: 0,
            duration: SWIPE_IN_MS,
            useNativeDriver: true,
          }).start(() => {
            isAnimatingRef.current = false;
          });
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
            bounciness: 4,
          }).start(() => {
            isAnimatingRef.current = false;
          });
        },
      }),
    [height, maxDrag, normalizedPath, routeIndex, router, swipeDistance, translateX, width]
  );

  const responderRef = useRef(panResponder);
  responderRef.current = panResponder;

  const sceneScale = translateX.interpolate({
    inputRange: [-maxDrag, 0, maxDrag],
    outputRange: [0.985, 1, 0.985],
    extrapolate: 'clamp',
  });
  const leftRailOpacity = translateX.interpolate({
    inputRange: [0, maxDrag],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const rightRailOpacity = translateX.interpolate({
    inputRange: [-maxDrag, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container} {...responderRef.current.panHandlers}>
      <Animated.View pointerEvents="none" style={[styles.swipeRail, styles.leftRail, { opacity: leftRailOpacity }]}>
        <Text style={styles.railKicker}>Previous</Text>
        <Text style={styles.railLabel}>{previousRoute?.label ?? 'LottoMind'}</Text>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.swipeRail, styles.rightRail, { opacity: rightRailOpacity }]}>
        <Text style={styles.railKicker}>Next</Text>
        <Text style={styles.railLabel}>{nextRoute?.label ?? 'LottoMind'}</Text>
      </Animated.View>
      <Animated.View style={[styles.scene, { transform: [{ translateX }, { scale: sceneScale }] }]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#020610',
  },
  scene: {
    flex: 1,
  },
  swipeRail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 112,
    zIndex: 0,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderColor: 'rgba(212, 175, 55, 0.18)',
  },
  leftRail: {
    left: 0,
    alignItems: 'flex-start',
    borderRightWidth: 1,
  },
  rightRail: {
    right: 0,
    alignItems: 'flex-end',
    borderLeftWidth: 1,
  },
  railKicker: {
    color: '#7DE8FF',
    fontSize: 9,
    fontWeight: '900' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  railLabel: {
    marginTop: 5,
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '900' as const,
  },
});
