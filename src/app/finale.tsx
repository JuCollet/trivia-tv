import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import AppText from '@/components/AppText';
import FocusableButton from '@/components/FocusableButton';
import Screen from '@/components/Screen';
import { MOCK_PLAYERS } from '@/game/mock';
import { colors, radius, s, spacing } from '@/theme';

const PODIUM_HEIGHTS = [s(140), s(100), s(72)];

// TV screen 7: mystery final question announcement (points ×2), then podium and badges.
export default function TvFinale() {
  const [step, setStep] = useState<'intro' | 'podium'>('intro');
  const podium = [...MOCK_PLAYERS].sort((a, b) => b.score - a.score).slice(0, 3);

  if (step === 'intro') {
    return (
      <Screen centered>
        <AppText variant="title" muted>
          Question finale mystère
        </AppText>
        <AppText variant="hero">Points ×2</AppText>
        {/* TODO: go to /question with the randomly drawn theme. */}
        <FocusableButton label="Voir le podium" onPress={() => setStep('podium')} hasTVPreferredFocus />
      </Screen>
    );
  }

  return (
    <Screen centered>
      <AppText variant="display">Podium</AppText>
      <View style={styles.podium}>
        {[podium[1], podium[0], podium[2]].map((player) => {
          if (!player) return null;
          const rank = podium.indexOf(player);
          return (
            <View key={player.id} style={styles.step}>
              <AppText variant="title">{player.name}</AppText>
              <AppText muted>{player.score} pts</AppText>
              <View style={[styles.block, { height: PODIUM_HEIGHTS[rank] }]}>
                <AppText variant="display">{rank + 1}</AppText>
              </View>
            </View>
          );
        })}
      </View>
      {/* TODO: game badges (awards accumulated per player). */}
      <FocusableButton label="Nouvelle partie" onPress={() => router.replace('/')} hasTVPreferredFocus />
    </Screen>
  );
}

const styles = StyleSheet.create({
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.lg,
    marginVertical: spacing.lg,
  },
  step: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  block: {
    width: s(140),
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
