import { router } from "expo-router";
import { ShoppingBag, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ARCADE_THEME } from "@/constants/arcadeTheme";
import { arcadeStorage } from "@/services/arcadeStorage";

const STORE_ITEMS = [
  { id: "emerald-aura", title: "Emerald Aura", cost: 20, body: "Cosmetic glow slot for future hero art." },
  { id: "extra-run", title: "Extra Run", cost: 10, body: "Prototype hook for one extra arcade run." },
  { id: "dream-run", title: "Dream Run", cost: 15, body: "Prototype hook for a Dream Oracle remix." },
];

export default function ArcadeStoreScreen() {
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    arcadeStorage.getCredits().then(setCredits);
  }, []);

  const buy = async (itemId: string, cost: number) => {
    const ok = await arcadeStorage.spendCredits(cost);
    if (!ok) return;
    if (itemId !== "extra-run" && itemId !== "dream-run") {
      await arcadeStorage.unlockCosmetic(itemId);
    }
    setCredits(await arcadeStorage.getCredits());
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Close store">
            <X size={20} color={ARCADE_THEME.gold} />
          </Pressable>
          <View>
            <Text style={styles.kicker}>Arcade Store</Text>
            <Text style={styles.title}>{credits} Lotto Credits</Text>
          </View>
        </View>

        <View style={styles.notice}>
          <ShoppingBag size={22} color={ARCADE_THEME.gold} />
          <Text style={styles.noticeText}>Credits unlock cosmetics, extra runs, and arcade features only. No real payments are active in this prototype.</Text>
        </View>

        {STORE_ITEMS.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemBody}>{item.body}</Text>
            </View>
            <Pressable style={styles.buyButton} onPress={() => buy(item.id, item.cost)}>
              <Text style={styles.buyText}>{item.cost}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ARCADE_THEME.black },
  content: { gap: 12, padding: 16, paddingTop: 56, paddingBottom: 32 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6 },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.34)",
    backgroundColor: "rgba(5, 5, 5, 0.72)",
  },
  kicker: { color: ARCADE_THEME.gold, fontSize: 11, fontWeight: "900", letterSpacing: 0, textTransform: "uppercase" },
  title: { color: ARCADE_THEME.ivory, fontSize: 22, fontWeight: "900", letterSpacing: 0 },
  notice: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    backgroundColor: "rgba(11, 61, 46, 0.68)",
    padding: 14,
  },
  noticeText: { flex: 1, color: "rgba(255,255,255,0.74)", fontSize: 12, fontWeight: "700", lineHeight: 17, letterSpacing: 0 },
  item: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.26)",
    backgroundColor: "rgba(5, 5, 5, 0.76)",
    padding: 14,
  },
  itemText: { flex: 1, gap: 4 },
  itemTitle: { color: ARCADE_THEME.ivory, fontSize: 16, fontWeight: "900", letterSpacing: 0 },
  itemBody: { color: "rgba(255,255,255,0.64)", fontSize: 12, fontWeight: "700", lineHeight: 17, letterSpacing: 0 },
  buyButton: {
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: ARCADE_THEME.gold,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  buyText: { color: ARCADE_THEME.black, fontWeight: "900", letterSpacing: 0 },
});

