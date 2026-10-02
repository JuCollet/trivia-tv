import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import AppText from '@/components/AppText';
import FocusableButton from '@/components/FocusableButton';
import Screen from '@/components/Screen';
import { MOCK_AWARDS, playerName } from '@/game/mock';
import { AWARDS, roundAwardsToShow } from '@/game/rules';
import { colors, radius, s, spacing } from '@/theme';

// TV screen 6: carousel of the round's awards, one award at a time.
export default function TvAwards() {
  const awards = roundAwardsToShow(MOCK_AWARDS);
  const [index, setIndex] = useState(0);
  const award = awards[index];
  const isLast = index >= awards.length - 1;

  // TODO: go to /theme while there are rounds left.
  const next = () => (isLast ? router.replace('/finale') : setIndex((i) => i + 1));

  return (
    <Screen centered>
      <AppText variant="title" muted>
        Fin de manche
      </AppText>

      {award ? (
        <View key={index} style={styles.card}>
          <AppText variant="display">{AWARDS[award.id].label}</AppText>
          <AppText variant="hero">{playerName(award.playerId)}</AppText>
          {award.points !== 0 ? (
            <AppText variant="display" style={award.points > 0 ? styles.gain : styles.loss}>
              {award.points > 0 ? `+${award.points}` : award.points}
            </AppText>
          ) : null}
          <AppText muted style={styles.description}>
            {AWARDS[award.id].description}
          </AppText>
        </View>
      ) : (
        <AppText variant="display">Aucune récompense cette fois</AppText>
      )}

      <View style={styles.dots}>
        {awards.map((a, i) => (
          <View key={`${a.id}-${a.playerId}`} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <FocusableButton label={isLast ? 'Continuer' : 'Suivant'} onPress={next} hasTVPreferredFocus />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    minWidth: '60%',
  },
  gain: {
    color: colors.success,
  },
  loss: {
    color: colors.danger,
  },
  description: {
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: s(10),
    height: s(10),
    borderRadius: s(5),
    backgroundColor: colors.surfaceRaised,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
});
