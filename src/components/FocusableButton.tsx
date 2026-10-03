import { useEffect, useId, useState, type Ref } from 'react';
import { Pressable, StyleSheet, type View, type ViewStyle } from 'react-native';
import AppText from './AppText';
import { playSfx, type SfxName } from '@/audio/sounds';
import { colors, radius, s, spacing } from '@/theme';

type Props = {
  label: string;
  onPress?: () => void;
  // On TV, the button that gets focus when the screen opens.
  hasTVPreferredFocus?: boolean;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: ViewStyle;
  ref?: Ref<View>;
  // Sound played on press: 'start' for the important buttons.
  sound?: SfxName;
};

// When buttons appear (new screen, new step), the TV gives focus to one of
// them on its own: that first focus is not a D-pad move and stays silent.
let skipNextFocusSound = false;
// The TV can give focus back to the same button without any D-pad move
// (splash screen hidden, app back in the foreground): that stays silent too.
let lastFocusedId: string | null = null;
// Off while the splash screen covers the app: nothing can be seen anyway.
let focusSoundEnabled = true;

export function setFocusSoundEnabled(enabled: boolean) {
  focusSoundEnabled = enabled;
}

// D-pad controllable button: focus is shown with an outline and a slight zoom.
export default function FocusableButton({
  label,
  onPress,
  hasTVPreferredFocus,
  variant = 'primary',
  disabled,
  style,
  ref,
  sound = 'click',
}: Props) {
  const [focused, setFocused] = useState(false);
  const id = useId();

  useEffect(() => {
    skipNextFocusSound = true;
  }, []);

  return (
    <Pressable
      ref={ref}
      onPress={() => {
        // A disabled button stays focusable so the press can be refused with a sound.
        if (disabled) {
          void playSfx('disabled');
          return;
        }
        void playSfx(sound);
        onPress?.();
      }}
      // Our own press sound replaces the Android system click.
      android_disableSound
      onFocus={() => {
        setFocused(true);
        const isRefocus = lastFocusedId === id;
        lastFocusedId = id;
        if (skipNextFocusSound) {
          skipNextFocusSound = false;
          return;
        }
        if (focusSoundEnabled && !isRefocus) void playSfx('focus');
      }}
      onBlur={() => setFocused(false)}
      hasTVPreferredFocus={hasTVPreferredFocus}
      accessibilityState={{ disabled }}
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
