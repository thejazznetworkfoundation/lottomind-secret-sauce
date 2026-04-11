import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import FloatingParticles from '@/components/FloatingParticles';

const BG_IMAGE = 'https://r2-pub.rork.com/generated-images/46e83a89-3280-4d6d-a644-252772df3392.png';

interface AppBackgroundProps {
  children: React.ReactNode;
  style?: object;
}

export default function AppBackground({ children, style }: AppBackgroundProps) {
  return (
    <ImageBackground
      source={{ uri: BG_IMAGE }}
      style={[styles.background, style]}
      resizeMode="cover"
      imageStyle={styles.image}
    >
      <View style={styles.overlay} />
      <FloatingParticles count={12} color="rgba(0, 229, 255, 0.10)" />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  image: {
    opacity: 0.55,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 11, 24, 0.55)',
  },
});
