import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';
import type { PointsBreakdownLine, PointsPart } from '@/game/breakdown';
import { colors, fonts, spacing } from '@/theme';

type Props = {
  lines: PointsBreakdownLine[];
  nameOf: (playerId: string) => string;
};

// One line per player: every point won (+) or lost (−) on this question,
// then the total that went into their score.
export default function PointsBreakdown({ lines, nameOf }: Props) {
  const { t } = useTranslation();

  const label = (part: PointsPart) =>
    t(`results.breakdown.${part.kind}`, {
      name: part.otherId ? nameOf(part.otherId) : '',
    });

  return (
    <View style={styles.list}>
      {lines.map(({ line, parts }) => (
        <View key={line.playerId} style={styles.row}>
          <AppText style={styles.name} numberOfLines={1}>
            {nameOf(line.playerId)}
          </AppText>
          <View style={styles.parts}>
            {parts.map((part) => (
              <AppText key={part.kind} variant="caption" style={part.points === 0 ? styles.zero : undefined}>
                {part.points !== 0 ? (
                  <AppText variant="caption" style={[styles.amount, signStyle(part.points)]}>
                    {`${signed(part.points)} `}
                  </AppText>
                ) : null}
                {label(part)}
              </AppText>
            ))}
          </View>
          <AppText style={[styles.points, signStyle(line.points)]}>{signed(line.points)}</AppText>
        </View>
      ))}
    </View>
  );
}

function signed(points: number) {
  return points > 0 ? `+${points}` : `${points}`;
}

function signStyle(points: number) {
  return points > 0 ? styles.gain : points < 0 ? styles.loss : styles.zero;
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
    maxWidth: '30%',
  },
  parts: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
  },
  amount: {
    fontFamily: fonts.bodyBold,
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
