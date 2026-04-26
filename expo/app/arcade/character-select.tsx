import { router } from "expo-router";
import { Check, Lock, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PlayerSprite from "@/components/arcade/PlayerSprite";
import { ARCADE_THEME } from "@/constants/arcadeTheme";
import { arcadeStorage } from "@/services/arcadeStorage";

const CHARACTERS = [
  { id: "lottomind-hero", name: "LottoMind Hero", state: "idle" as const, unlocked: true },
  { id: "gold-oracle-runner", name: "Gold Oracle", state: "victory" as const, unlocked: true },
  { id: "vault-vine-scout", name: "Vault Vine Scout", state: "swing" as const, unlocked: true },
];

export default function CharacterSelectScreen() {
  const [selectedCharacter, setSelectedCharacter] = useState("lottomind-hero");
  const [unlocked, setUnlocked] = useState<string[]>(["lottomind-hero"]);

  useEffect(() => {
    arcadeStorage.getSelectedCharacter().then(setSelectedCharacter);
    arcadeStorage.getUnlockedCharacters().then(setUnlocked);
  }, []);

  const selectCharacter = async (characterId: string) => {
    setSelectedCharacter(characterId);
    await arcadeStorage.setSelectedCharacter(characterId);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Close character select">
            <X size={20} color={ARCADE_THEME.gold} />
          </Pressable>
          <View>
            <Text style={styles.kicker}>Character Select</Text>
            <Text style={styles.title}>Choose Your LottoMind Hero</Text>
          </View>
        </View>

        {CHARACTERS.map((character) => {
          const isUnlocked = character.unlocked || unlocked.includes(character.id);
          const selected = selectedCharacter === character.id;
          return (
            <Pressable
              key={character.id}
              style={[styles.card, selected && styles.selected, !isUnlocked && styles.locked]}
              onPress={isUnlocked ? () => selectCharacter(character.id) : undefined}
            >
              <PlayerSprite state={character.state} width={70} height={88} />
              <View style={styles.cardText}>
                <Text style={styles.characterName}>{character.name}</Text>
                <Text style={styles.characterBody}>Original LottoMind jungle arcade placeholder with transparent PNG-ready art slot.</Text>
              </View>
              {selected ? <Check size={22} color={ARCADE_THEME.gold} /> : isUnlocked ? null : <Lock size={22} color="rgba(255,255,255,0.35)" />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ARCADE_THEME.black,
  },
  content: {
    gap: 12,
    padding: 16,
    paddingTop: 56,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
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
  kicker: {
    color: ARCADE_THEME.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: ARCADE_THEME.ivory,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0,
  },
  card: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.28)",
    backgroundColor: "rgba(5, 5, 5, 0.78)",
    padding: 14,
  },
  selected: {
    borderColor: ARCADE_THEME.gold,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
  },
  locked: {
    opacity: 0.52,
  },
  cardText: {
    flex: 1,
    gap: 5,
  },
  characterName: {
    color: ARCADE_THEME.ivory,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0,
  },
  characterBody: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    letterSpacing: 0,
  },
});

