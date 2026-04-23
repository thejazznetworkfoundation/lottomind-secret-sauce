import React, { useMemo, useRef } from 'react';
import { Dimensions, PanResponder, StyleSheet, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const EDGE_ZONE = 52;
const SWIPE_DISTANCE = 72;
const SWIPE_VELOCITY = 0.35;

const SWIPE_ROUTES = [
  '/',
  '/powertools',
  '/dreams',
  '/heatmap',
  '/sequence',
  '/history',
  '/arcade',
  '/trivia-rewards',
  '/credit-store',
  '/scanner',
  '/live-data',
  '/intelligence',
  '/pick-games',
  '/store-locator',
  '/horoscope',
  '/lottomind-ai',
  '/nationwide-analysis',
  '/name-numbers',
  '/us-lottery',
  '/lucky-weather',
  '/crossword',
  '/word-search',
  '/ludo',
  '/card-game',
  '/shop',
  '/profile',
  '/help',
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
  const normalizedPath = normalizePath(pathname);
  const routeIndex = SWIPE_ROUTES.indexOf(normalizedPath as (typeof SWIPE_ROUTES)[number]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Edge-only horizontal swipes keep vertical scrolling and game controls usable.
        onMoveShouldSetPanResponderCapture: (event, gestureState) => {
          const fromEdge = event.nativeEvent.pageX <= EDGE_ZONE || event.nativeEvent.pageX >= SCREEN_WIDTH - EDGE_ZONE;
          const horizontal = Math.abs(gestureState.dx) > 24 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.45;
          return routeIndex >= 0 && fromEdge && horizontal;
        },
        onPanResponderRelease: (_, gestureState) => {
          if (routeIndex < 0) {
            return;
          }

          const shouldNavigate = Math.abs(gestureState.dx) >= SWIPE_DISTANCE || Math.abs(gestureState.vx) >= SWIPE_VELOCITY;
          if (!shouldNavigate) {
            return;
          }

          const direction = gestureState.dx < 0 ? 1 : -1;
          const nextIndex = (routeIndex + direction + SWIPE_ROUTES.length) % SWIPE_ROUTES.length;
          const nextRoute = SWIPE_ROUTES[nextIndex];

          if (nextRoute !== normalizedPath) {
            router.replace(nextRoute as never);
          }
        },
      }),
    [normalizedPath, routeIndex, router]
  );

  const responderRef = useRef(panResponder);
  responderRef.current = panResponder;

  return (
    <View style={styles.container} {...responderRef.current.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
