import { StyleSheet, Text, View } from "react-native";

import { ARCADE_COLORS } from "@/constants/arcade";
import type { ArcadeSnapshot } from "@/types/arcade";

import { BossThreatBar } from "./BossThreatBar";
import { GoalPanel } from "./GoalPanel";

interface ArcadeHUDProps {
  snapshot: ArcadeSnapshot;
}

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

export function ArcadeHUD({ snapshot }: ArcadeHUDProps) {
  return (
    <View pointerEvents="none" style={styles.root}>
      <View style={styles.topRow}>
        <StatCard label="Score" value={snapshot.player.score} accent={ARCADE_COLORS.gold} />
        <StatCard label="Time" value={formatTime(snapshot.remainingTime)} accent={ARCADE_COLORS.purple} />
        <StatCard label="Lives" value={snapshot.player.lives} accent={ARCADE_COLORS.teal} />
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.leftPanel}>
          <BossThreatBar threat={snapshot.boss.threat} />
        </View>
        <View style={styles.rightPanel}>
          <GoalPanel checkpointLabel={snapshot.checkpointLabel} distanceRemaining={snapshot.distanceRemaining} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 10,
    zIndex: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bottomRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  leftPanel: {
    flex: 1.05,
    marginRight: 10,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(8, 9, 19, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(191, 115, 255, 0.24)",
  },
  rightPanel: {
    flex: 1.2,
  },
  statCard: {
    minWidth: 126,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "rgba(8, 9, 19, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(255, 201, 95, 0.22)",
  },
  statLabel: {
    color: ARCADE_COLORS.gold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  statValue: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "800",
  },
});
