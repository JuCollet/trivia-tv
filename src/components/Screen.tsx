import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet, View, type ImageSourcePropType, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, safeArea, spacing } from '@/theme';

type Props = {
  children: ReactNode;
  centered?: boolean;
  style?: ViewStyle;
  // Full-screen image behind the content, edge to edge (outside the safe area).
  background?: ImageSourcePropType;
};

export default function Screen({ children, centered, style, background }: Props) {
  const content = (
    <SafeAreaView style={[styles.safe, background ? styles.transparent : null]}>
      <View style={[styles.content, centered && styles.centered, style]}>{children}</View>
    </SafeAreaView>
  );

  if (!background) return content;
  return (
    <ImageBackground source={background} resizeMode="cover" style={styles.safe} imageStyle={styles.image}>
      {content}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Without an explicit size, react-native-web draws the image at its own
  // size, leaving the edges uncovered on screens larger than the picture.
  image: {
    width: '100%',
    height: '100%',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: safeArea.horizontal,
    paddingVertical: safeArea.vertical,
    gap: spacing.md,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
