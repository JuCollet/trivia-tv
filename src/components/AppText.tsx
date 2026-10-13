import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors, fonts, fontSize } from '@/theme';

type Variant = 'caption' | 'body' | 'title' | 'display' | 'hero';

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
};

export default function AppText({ variant = 'body', muted, style, ...rest }: Props) {
  return <Text {...rest} style={[styles.base, styles[variant], muted && styles.muted, style]} />;
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
  },
  muted: {
    color: colors.textMuted,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: fontSize.caption,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSize.body,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.title,
  },
  display: {
    fontFamily: fonts.display,
    fontSize: fontSize.display,
  },
  hero: {
    fontFamily: fonts.display,
    fontSize: fontSize.hero,
  },
});
