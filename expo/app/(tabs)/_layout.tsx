import { Tabs } from 'expo-router';
import { Dices, Grid3x3, Clock, Moon, Activity } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          shadowColor: isDark ? '#00E5FF' : '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.15 : 0.05,
          shadowRadius: 12,
          elevation: 8,
          ...(Platform.OS === 'web' ? { height: 60 } : {}),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Generate',
          tabBarIcon: ({ color, size }) => <Dices color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="heatmap"
        options={{
          title: 'Heatmap',
          tabBarIcon: ({ color, size }) => <Grid3x3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="dreams"
        options={{
          title: 'Dreams',
          tabBarIcon: ({ color, size }) => <Moon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
          title: 'AI Chat',
          tabBarIcon: ({ color, size }) => <Dices color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sequence"
        options={{
          title: 'Sequence',
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
