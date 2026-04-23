import { StyleSheet, View } from "react-native";

import type { ParticleEntity } from "@/types/arcade";

interface ArcadeParticlesProps {
  particles: ParticleEntity[];
  cameraX: number;
}

export function ArcadeParticles({ particles, cameraX }: ArcadeParticlesProps) {
  return (
    <View pointerEvents="none" style={styles.root}>
      {particles.map((particle) => (
        <View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x - cameraX,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
              backgroundColor: particle.color,
              opacity: particle.life / particle.maxLife,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: "absolute",
  },
});
