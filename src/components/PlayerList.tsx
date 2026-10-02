import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import type { Player } from '@/game/types';
import { colors, radius, spacing } from '@/theme';

type Props = {
  players: Player[];
  showScores?: boolean;
  showThemeStatus?: boolean;
};

export default function PlayerList({ players, showScores, showThemeStatus }: Props) {
  return (
    <View style={styles.list}>
      {players.map((player, rank) => (
        <View key={player.id} style={styles.row}>
          {showScores ? <AppText muted>{rank + 1}.</AppText> : null}
          <AppText variant="title" style={styles.name}>
            {player.name}
          </AppText>
          {showThemeStatus ? (
            <AppText muted>{player.themesReady ? 'Thèmes prêts ✓' : 'Saisit ses thèmes…'}</AppText>
          ) : null}
          {showScores ? <AppText variant="title">{player.score}</AppText> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  name: {
    flex: 1,
  },
});
