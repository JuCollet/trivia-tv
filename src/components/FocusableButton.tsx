import { useEffect, useId, useState, type ComponentProps, type Ref } from 'react';
import { Pressable, StyleSheet, type TextStyle, type View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { playSfx, type SfxName } from '@/audio/sounds';
import { colors, radius, s, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'launch';

type Props = {
  label: string;
  onPress?: () => void;
  // On TV, the button that gets focus when the screen opens.
  hasTVPreferredFocus?: boolean;
  variant?: Variant;
  // Icon drawn before the label, at the label's size and color.
  icon?: ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
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

// Off while the splash screen covers the app: OK on the remote skips the
// intro and must not also press the button focused underneath.
let pressEnabled = true;

export function setFocusSoundEnabled(enabled: boolean) {
  focusSoundEnabled = enabled;
}

export function setPressEnabled(enabled: boolean) {
  pressEnabled = enabled;
}

// D-pad controllable button: focus is shown with an outline and a slight zoom.
export default function FocusableButton({
  label,
  onPress,
  hasTVPreferredFocus,
  variant = 'primary',
  icon,
  disabled,
  style,
  labelStyle,
  ref,
  sound = 'click',
}: Props) {
  const [focused, setFocused] = useState(false);
  const id = useId();

  useEffect(() => {
    skipNextFocusSound = true;
  }, []);

  const textStyle = StyleSheet.flatten<TextStyle>([styles.label, LABEL_STYLES[variant], labelStyle]);

  return (
    <Pressable
      ref={ref}
      onPress={() => {
        if (!pressEnabled) return;
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
        styles[variant],
        focused && styles.focused,
        (pressed || disabled) && styles.dimmed,
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={textStyle.fontSize}
          color={textStyle.color as string}
        />
      ) : null}
      <AppText variant="title" style={textStyle}>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: s(20),
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surfaceRaised,
  },
  outline: {
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
  },
  // Big red call to action with a darker bottom edge, like an arcade button.
  launch: {
    backgroundColor: colors.launch,
    borderBottomColor: colors.launchEdge,
    borderBottomWidth: s(5),
    borderRadius: radius.lg,
  },
  focused: {
    borderColor: colors.focus,
    transform: [{ scale: 1.06 }],
  },
  dimmed: {
    opacity: 0.6,
  },
});

const LABEL_STYLES = StyleSheet.create({
  primary: { color: colors.background },
  secondary: {},
  outline: {},
  launch: {},
});
