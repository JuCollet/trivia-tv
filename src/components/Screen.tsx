import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, safeArea, spacing } from '@/theme';

type Props = {
  children: ReactNode;
  centered?: boolean;
  style?: ViewStyle;
};

export default function Screen({ children, centered, style }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.content, centered && styles.centered, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
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
