import { useState } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import AppText from './AppText';
import { colors, radius, s, spacing } from '@/theme';

type Props = {
  label: string;
  onPress?: () => void;
  // On TV, the button that gets focus when the screen opens.
  hasTVPreferredFocus?: boolean;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: ViewStyle;
};

// D-pad controllable button: focus is shown with an outline and a slight zoom.
export default function FocusableButton({
  label,
  onPress,
  hasTVPreferredFocus,
  variant = 'primary',
  disabled,
  style,
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      hasTVPreferredFocus={hasTVPreferredFocus}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        focused && styles.focused,
        (pressed || disabled) && styles.dimmed,
        style,
      ]}
    >
      <AppText variant="title" style={variant === 'primary' && styles.primaryLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: s(3),
    borderColor: 'transparent',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  primaryLabel: {
    color: colors.background,
  },
  secondary: {
    backgroundColor: colors.surfaceRaised,
  },
  focused: {
    borderColor: colors.focus,
    transform: [{ scale: 1.06 }],
  },
  dimmed: {
    opacity: 0.6,
  },
});
