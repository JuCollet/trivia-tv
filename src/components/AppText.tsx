import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors, fontSize } from '@/theme';

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
    fontSize: fontSize.caption,
  },
  body: {
    fontSize: fontSize.body,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: '700',
  },
  display: {
    fontSize: fontSize.display,
    fontWeight: '800',
  },
  hero: {
    fontSize: fontSize.hero,
    fontWeight: '900',
  },
});
