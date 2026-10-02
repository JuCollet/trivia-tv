import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import AppText from "@/components/AppText";
import FocusableButton from "@/components/FocusableButton";
import OptionPicker from "@/components/OptionPicker";
import Screen from "@/components/Screen";
import { DEFAULT_SETTINGS } from "@/game/rules";
import type { GameSettings, Language } from "@/game/types";
import { spacing } from "@/theme";

const LANGUAGES: readonly Language[] = ["fr", "en"];
const QUESTIONS_PER_THEME = [2, 3, 4, 5] as const;
const ROUNDS = [1, 2, 3] as const;
const TIMERS = [10, 15, 20, 30] as const;

// TV screen 1: home and game settings.
export default function TvHome() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const update = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K],
  ) => setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <Screen>
      <AppText variant="hero">Chacun Son Truc</AppText>
      <AppText muted>Le quiz où chacun choisit le thème des autres.</AppText>

      <View style={styles.settings}>
        <OptionPicker
          label="Langue"
          options={LANGUAGES}
          value={settings.language}
          onChange={(v) => update("language", v)}
          format={(v) => (v === "fr" ? "Français" : "English")}
          hasTVPreferredFocus
        />
        <OptionPicker
          label="Questions par thème"
          options={QUESTIONS_PER_THEME}
          value={settings.questionsPerTheme}
          onChange={(v) => update("questionsPerTheme", v)}
        />
        <OptionPicker
          label="Tours"
          options={ROUNDS}
          value={settings.rounds}
          onChange={(v) => update("rounds", v)}
        />
        <OptionPicker
          label="Chrono"
          options={TIMERS}
          value={settings.timerSeconds}
          onChange={(v) => update("timerSeconds", v)}
          format={(v) => `${v} s`}
        />
      </View>

      <FocusableButton
        label="Créer la salle"
        onPress={() => router.push("/lobby")}
        style={styles.cta}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  settings: {
    gap: spacing.xs,
    marginVertical: spacing.md,
  },
  cta: {
    alignSelf: "flex-start",
  },
});
