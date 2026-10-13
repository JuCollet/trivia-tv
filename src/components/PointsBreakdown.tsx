import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';
import type { PointsBreakdownLine } from '@/game/breakdown';
import { MASTER_POINTS_PER_FINDER } from '@/game/rules';
import { colors, fonts, spacing } from '@/theme';

type Props = {
  lines: PointsBreakdownLine[];
  nameOf: (playerId: string) => string;
};

// One line per player: where their points on this question come from.
export default function PointsBreakdown({ lines, nameOf }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.list}>
      {lines.map(({ line, reason, steal }) => {
        const details = [
          reason === 'correct'
            ? t('results.breakdown.correct', { base: line.basePoints, speed: line.speedBonus })
            : reason === 'masterFinders'
              ? t('results.breakdown.masterFinders', {
                  points: MASTER_POINTS_PER_FINDER,
                  count: line.points / MASTER_POINTS_PER_FINDER,
                })
              : t(`results.breakdown.${reason}`),
        ];
        if (steal > 0) details.push(t('results.breakdown.steals', { points: steal }));
        if (steal < 0) details.push(t('results.breakdown.stolen', { points: -steal }));

        return (
          <View key={line.playerId} style={styles.row}>
            <AppText style={styles.name} numberOfLines={1}>
              {nameOf(line.playerId)}
            </AppText>
            <AppText variant="caption" muted style={styles.detail} numberOfLines={1}>
              {details.join(' · ')}
            </AppText>
            <AppText style={[styles.points, line.points > 0 ? styles.gain : line.points < 0 ? styles.loss : styles.zero]}>
              {line.points > 0 ? `+${line.points}` : line.points}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    maxWidth: '35%',
  },
  detail: {
    flex: 1,
  },
  points: {
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
