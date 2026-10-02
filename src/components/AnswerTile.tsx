import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import { answerLetters, colors, radius, s, spacing } from '@/theme';

type Props = {
  index: number;
  label: string;
  dimmed?: boolean;
};

// Colored multiple-choice answer, with its letter for color-blind players and to match the phone buttons.
export default function AnswerTile({ index, label, dimmed }: Props) {
  return (
    <View style={[styles.tile, { backgroundColor: colors.answers[index] }, dimmed && styles.dimmed]}>
      <View style={styles.badge}>
        <AppText variant="title">{answerLetters[index]}</AppText>
      </View>
      <AppText variant="title" style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  badge: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
  dimmed: {
    opacity: 0.35,
  },
});
