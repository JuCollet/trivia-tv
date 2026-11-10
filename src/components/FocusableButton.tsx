import { useEffect, useId, useState, type ComponentProps, type Ref } from 'react';
import { Pressable, StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { playSfx, type SfxName } from '@/audio/sounds';
import { colors, radius, s, spacing } from '@/theme';

// 'round': a white disc showing only the icon (the label is read by
// accessibility), with a translucent ring around it on focus.
type Variant = 'primary' | 'secondary' | 'outline' | 'launch' | 'round';

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
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        focused && (variant === 'round' ? styles.roundFocused : styles.focused),
        (pressed || disabled) && styles.dimmed,
        style,
      ]}
    >
      {variant === 'round' ? (
        <View style={styles.roundFace}>
          {icon ? <Ionicons name={icon} size={ROUND_ICON_SIZE} color={colors.background} /> : null}
        </View>
      ) : icon ? (
        <Ionicons name={icon} size={textStyle.fontSize} color={textStyle.color as string} />
      ) : null}
      {variant === 'round' ? null : (
        <AppText variant="title" style={textStyle}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

export const ROUND_SIZE = s(64);
export const ROUND_RING = s(5);
const ROUND_ICON_SIZE = s(30);

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
  // The disc plus the room for its focus ring: place it by the ring's outer edge.
  round: {
    width: ROUND_SIZE + 2 * ROUND_RING,
    height: ROUND_SIZE + 2 * ROUND_RING,
    padding: ROUND_RING,
    borderWidth: 0,
    borderRadius: ROUND_SIZE,
  },
  roundFace: {
    width: ROUND_SIZE,
    height: ROUND_SIZE,
    borderRadius: ROUND_SIZE / 2,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    transform: [{ scale: 1.06 }],
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
  round: {},
});
