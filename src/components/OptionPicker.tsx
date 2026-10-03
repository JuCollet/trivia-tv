import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import FocusableButton from './FocusableButton';
import { colors, spacing } from '@/theme';

type Props<T extends string | number> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  format?: (value: T) => string;
  hasTVPreferredFocus?: boolean;
};

// Settings row: a label and options selectable with the D-pad.
export default function OptionPicker<T extends string | number>({
  label,
  options,
  value,
  onChange,
  format = String,
  hasTVPreferredFocus,
}: Props<T>) {
  return (
    <View style={styles.row}>
      <AppText variant="title" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.options}>
        {options.map((option, i) => (
          <FocusableButton
            key={String(option)}
            label={format(option)}
            variant={option === value ? 'primary' : 'secondary'}
            onPress={() => onChange(option)}
            sound="option"
            hasTVPreferredFocus={hasTVPreferredFocus && i === 0}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceRaised,
  },
  label: {
    flex: 1,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
