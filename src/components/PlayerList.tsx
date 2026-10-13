import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import type { Player } from '@/game/types';
import { colors, fonts, radius, spacing } from '@/theme';

type RankedPlayer = Pick<Player, 'id' | 'name' | 'score'>;

type Props = {
  players: RankedPlayer[];
  showScores?: boolean;
  // Points just won (or lost) by player id, shown next to the total they are already in.
  gains?: Record<string, number>;
};

export default function PlayerList({ players, showScores, gains }: Props) {
  return (
    <View style={styles.list}>
      {players.map((player, rank) => (
        <View key={player.id} style={styles.row}>
          {showScores ? <AppText muted>{rank + 1}.</AppText> : null}
          <AppText variant="title" style={styles.name}>
            {player.name}
          </AppText>
          {showScores && gains ? <Gain points={gains[player.id] ?? 0} /> : null}
          {showScores ? <AppText variant="title">{player.score}</AppText> : null}
        </View>
      ))}
    </View>
  );
}

function Gain({ points }: { points: number }) {
  const style = points > 0 ? styles.gain : points < 0 ? styles.loss : styles.zero;
  return <AppText style={[styles.delta, style]}>{points > 0 ? `+${points}` : points}</AppText>;
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
  delta: {
    fontFamily: fonts.bodyBold,
  },
  gain: {
    color: colors.success,
  },
  loss: {
    color: colors.danger,
  },
  zero: {
    color: colors.textMuted,
  },
});
