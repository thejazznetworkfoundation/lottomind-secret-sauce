import { Tabs } from 'expo-router';
import { Activity, Clock, Grid3x3, LayoutDashboard, Moon, Sparkles, Wrench } from 'lucide-react-native';
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
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: Platform.OS === 'web' ? 14 : 18,
          height: 70,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'web' ? 8 : 10,
          paddingHorizontal: 8,
          backgroundColor: isDark ? 'rgba(4, 13, 30, 0.94)' : colors.tabBarBg,
          borderColor: isDark ? 'rgba(108, 215, 255, 0.24)' : colors.tabBarBorder,
          borderTopColor: isDark ? 'rgba(108, 215, 255, 0.24)' : colors.tabBarBorder,
          borderWidth: 1,
          borderTopWidth: 1,
          borderRadius: 28,
          shadowColor: isDark ? '#00E5FF' : '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: isDark ? 0.22 : 0.08,
          shadowRadius: 18,
          elevation: 14,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800' as const,
          letterSpacing: 0.15,
        },
        tabBarItemStyle: {
          borderRadius: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="powertools"
        options={{
          title: 'Power Tools',
          tabBarIcon: ({ color, size }) => <Wrench color={color} size={size} />,
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
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
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
