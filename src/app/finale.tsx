import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppText from '@/components/AppText';
import FocusableButton from '@/components/FocusableButton';
import LoadingScreen from '@/components/LoadingScreen';
import Screen from '@/components/Screen';
import { useScreenSfx } from '@/hooks/useScreenSfx';
import { useGame } from '@/game/GameProvider';
import { colors, radius, s, spacing } from '@/theme';

const PODIUM_HEIGHTS = [s(140), s(100), s(72)];

// TV screen 7: final podium, after the mystery final question.
export default function TvFinale() {
  const { t } = useTranslation();
  const { view, newGame } = useGame();
  useScreenSfx('podium');
  if (!view?.podium) return <LoadingScreen />;
  // Ranked by the server, ties broken by correct answers then speed.
  const podium = view.podium.slice(0, 3).map((entry) => ({ id: entry.playerId, ...entry }));

  return (
    <Screen centered>
      <AppText variant="display">{t('finale.podium')}</AppText>
      <View style={styles.podium}>
        {[podium[1], podium[0], podium[2]].map((player) => {
          if (!player) return null;
          const rank = podium.indexOf(player);
          return (
            <View key={player.id} style={styles.step}>
              <AppText variant="title">{player.name}</AppText>
              <AppText muted>{t('finale.points', { count: player.score })}</AppText>
              <View style={[styles.block, { height: PODIUM_HEIGHTS[rank] }]}>
                <AppText variant="display">{rank + 1}</AppText>
              </View>
            </View>
          );
        })}
      </View>
      {/* TODO: game badges (awards accumulated per player). */}
      {/* The phones follow the new game: everyone plays again without scanning. */}
      <FocusableButton label={t('common.newGame')} onPress={() => newGame()} sound="start" hasTVPreferredFocus />
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
