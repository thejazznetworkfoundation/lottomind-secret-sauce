import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LottoProvider } from "@/providers/LottoProvider";
import { JackpotProvider } from "@/providers/JackpotProvider";
import { GamificationProvider } from "@/providers/GamificationProvider";
import { ProProvider } from "@/providers/ProProvider";
import { TriviaProvider } from "@/providers/TriviaProvider";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import { MonetizationProvider } from "@/providers/MonetizationProvider";
import LegalDisclaimer from "@/components/LegalDisclaimer";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scanner" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="live-data" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="intelligence" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="pick-games" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="store-locator" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="profile" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="nationwide-analysis" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="lottomind-ai" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="name-numbers" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="shop" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="horoscope" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="trivia-rewards" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="trivia-play" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="trivia-redeem" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="help" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="viral-studio" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="us-lottery" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="lucky-weather" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="crossword" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="word-search" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="ludo" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="card-game" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="lottomind-historical" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="credit-store" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LottoProvider>
          <JackpotProvider>
            <GamificationProvider>
              <ProProvider>
                <MonetizationProvider>
                  <TriviaProvider>
                    <ThemeProvider>
                      <LegalDisclaimer>
                        <ThemedStatusBar />
                        <RootLayoutNav />
                      </LegalDisclaimer>
                    </ThemeProvider>
                  </TriviaProvider>
                </MonetizationProvider>
              </ProProvider>
            </GamificationProvider>
          </JackpotProvider>
        </LottoProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
