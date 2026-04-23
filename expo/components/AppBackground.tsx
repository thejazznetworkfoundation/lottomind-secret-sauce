import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AppBackgroundProps {
  children: React.ReactNode;
  style?: object;
}

export default function AppBackground({ children, style }: AppBackgroundProps) {
  return (
    <View style={[styles.background, style]}>
      <LinearGradient
        colors={['#020611', '#06162C', '#01030A']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbPrimary} />
      <View style={styles.orbSecondary} />
      <View style={styles.gridLayer}>
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={`h-${index}`} style={[styles.gridLineH, { top: `${index * 14}%` }]} />
        ))}
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={`v-${index}`} style={[styles.gridLineV, { left: `${index * 20}%` }]} />
        ))}
      </View>
      <View style={styles.staticSweep} />
      <View style={styles.vignette} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    overflow: 'hidden',
  },
  orbPrimary: {
    position: 'absolute',
    top: -70,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.16)',
  },
  orbSecondary: {
    position: 'absolute',
    left: -90,
    bottom: SCREEN_HEIGHT * 0.18,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(230, 194, 96, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 96, 0.14)',
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.42,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(92, 208, 255, 0.055)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(92, 208, 255, 0.045)',
  },
  staticSweep: {
    position: 'absolute',
    top: -120,
    right: '18%',
    width: 64,
    height: SCREEN_HEIGHT + 240,
    backgroundColor: 'rgba(122, 242, 255, 0.055)',
    transform: [{ rotate: '19deg' }],
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
});
