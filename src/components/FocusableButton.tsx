import { useEffect, useId, useState, type ComponentProps, type Ref } from 'react';
import { Pressable, StyleSheet, View, type TextStyle, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import ButtonFace from './ButtonFace';
import { playSfx, type SfxName } from '@/audio/sounds';
import { colors, fonts, gradients, radius, s, spacing } from '@/theme';

// 'round': a white disc showing only the icon (the label is read by
// accessibility), with a translucent ring around it on focus.
// 'go': a pill-shaped call to action, green with navy text, wrapped in a
// translucent ring on focus (same look as the round buttons, without any
// fake 3D edge). Greyed out while disabled.
// 'footer': a flat cell meant to fill part of a card's footer; focus lights it up.
type Variant = 'primary' | 'secondary' | 'outline' | 'round' | 'go' | 'footer';

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

  const textStyle = StyleSheet.flatten<TextStyle>([
    styles.label,
    LABEL_STYLES[variant],
    variant === 'go' && disabled && styles.goDisabledLabel,
    variant === 'footer' && focused && styles.footerFocusedLabel,
    labelStyle,
  ]);
  const content = (
    <>
      {icon ? (
        <Ionicons
          name={icon}
          // The go button's play icon stays a bit smaller than its big label.
          size={variant === 'go' ? Math.round((textStyle.fontSize ?? 0) * 0.8) : textStyle.fontSize}
          color={textStyle.color as string}
        />
      ) : null}
      <AppText variant="title" style={textStyle}>
        {label}
      </AppText>
    </>
  );

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
      // No accessibilityState.disabled: on Android it disables the native view,
      // which then cannot take focus and the D-pad skips over it.
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        focused && FOCUSED_STYLES[variant],
        // The go button shows its disabled state on its face.
        (pressed || (disabled && variant !== 'go')) && styles.dimmed,
        style,
      ]}
    >
      {variant === 'round' ? (
        <ButtonFace colors={gradients.round} domed borderRadius={ROUND_SIZE / 2} style={styles.roundFace}>
          {icon ? <Ionicons name={icon} size={ROUND_ICON_SIZE} color={colors.background} /> : null}
        </ButtonFace>
      ) : variant === 'go' ? (
        disabled ? (
          <View style={[styles.goFace, styles.goFaceDisabled]}>{content}</View>
        ) : (
          <ButtonFace colors={gradients.go} domed borderRadius={GO_HEIGHT / 2} style={styles.goFace}>
            {content}
          </ButtonFace>
        )
      ) : variant === 'footer' ? (
        content
      ) : (
        <>
          <ButtonFace
            colors={gradients[variant]}
            domed={variant === 'primary'}
            // Under the transparent border too, as the flat fill was; inside
            // it once the border shows (focus, outline).
            {...(focused || variant === 'outline'
              ? { borderRadius: radius.md - BORDER, style: styles.backdropInside }
              : { borderRadius: radius.md, style: styles.backdropUnderBorder })}
          />
          {content}
        </>
      )}
    </Pressable>
  );
}

export const ROUND_SIZE = s(64);
export const ROUND_RING = s(5);
const ROUND_ICON_SIZE = s(30);
const GO_HEIGHT = s(56);
const BORDER = s(3);
// Room around the go button's face for its focus ring.
export const GO_RING = s(5);

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: BORDER,
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
  primary: {},
  secondary: {},
  outline: {
    borderColor: colors.panelBorder,
  },
  // The face drawn behind the label of the rectangular buttons.
  backdropUnderBorder: {
    position: 'absolute',
    top: -BORDER,
    left: -BORDER,
    right: -BORDER,
    bottom: -BORDER,
  },
  backdropInside: {
    ...StyleSheet.absoluteFill,
  },
  // The ring around the face: invisible until focused.
  go: {
    paddingVertical: GO_RING,
    paddingHorizontal: GO_RING,
    borderWidth: 0,
    borderRadius: GO_HEIGHT,
  },
  goFace: {
    height: GO_HEIGHT,
    paddingLeft: s(20),
    paddingRight: s(24),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
  },
  // Translucent grey instead of the gradient: no shine, no shadow.
  goFaceDisabled: {
    paddingLeft: s(18),
    paddingRight: s(22),
    borderRadius: GO_HEIGHT / 2,
    borderWidth: s(2),
    borderColor: colors.disabledBorder,
    backgroundColor: colors.disabledFill,
  },
  goDisabledLabel: {
    color: colors.disabledText,
  },
  footer: {
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: colors.cardFooter,
  },
  footerFocusedLabel: {
    color: colors.text,
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
  goFocused: {
    backgroundColor: colors.focusRing,
  },
  footerFocused: {
    backgroundColor: colors.cardFooterFocused,
  },
  dimmed: {
    opacity: 0.6,
  },
});

const LABEL_STYLES = StyleSheet.create({
  primary: { color: colors.background },
  secondary: {},
  outline: {},
  round: {},
  go: { color: colors.onBright, fontFamily: fonts.bodyBold, fontSize: s(28), letterSpacing: s(1) },
  footer: { color: colors.highlight, fontFamily: fonts.bodySemiBold, fontSize: s(15) },
});

const FOCUSED_STYLES = {
  primary: styles.focused,
  secondary: styles.focused,
  outline: styles.focused,
  round: styles.roundFocused,
  go: styles.goFocused,
  footer: styles.footerFocused,
};
