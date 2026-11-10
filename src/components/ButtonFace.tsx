import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { s } from '@/theme';

type Props = {
  // Top, middle (at 45%) and bottom colors of the face.
  colors: readonly [string, string, string];
  // Domed: shine, light top edge, dark bottom edge and a drop shadow.
  // Otherwise matte: the gradient alone.
  domed?: boolean;
  borderRadius: number;
  style?: ViewStyle;
  children?: ReactNode;
};

const LOCATIONS = [0, 0.45, 1] as const;

// The surface of a button: a vertical gradient of its color, lit from the top.
// The domed look approximates a radial light near the top with a linear
// gradient plus a soft shine over the upper part of the face.
export default function ButtonFace({ colors, domed, borderRadius, style, children }: Props) {
  const round = { borderRadius };
  return (
    <View style={[round, { backgroundColor: colors[1] }, domed && styles.shadow, style]}>
      {/* Clipped separately so the clip does not cut the drop shadow. */}
      <View style={[StyleSheet.absoluteFill, round, styles.clip]} pointerEvents="none">
        <LinearGradient colors={colors} locations={LOCATIONS} style={StyleSheet.absoluteFill} />
        {domed ? (
          <>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0)']}
              style={[styles.shine, { borderRadius }]}
            />
            <View style={[StyleSheet.absoluteFill, round, styles.edges]} />
          </>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: s(1.5),
    left: '8%',
    right: '8%',
    height: '35%',
  },
  // Thin light line along the top inner edge, darker band along the bottom one.
  edges: {
    borderTopWidth: s(1),
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderBottomWidth: s(1.5),
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  shadow: {
    boxShadow: [{ offsetX: 0, offsetY: s(1), blurRadius: s(3), color: 'rgba(4, 8, 48, 0.35)' }],
  },
});
