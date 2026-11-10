import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

// White sunburst with a radial fade (opaque at the centre, transparent at the
// edge), tinted on display. A picture rather than SVG: no native dependency,
// and the same look on Apple TV, Android TV and the web.
const RAYS = require('../../assets/images/awards/rays.png');

type Props = {
  size: number;
  color: string;
  // 0–1, applied on top of the picture's own fade.
  opacity?: number;
  // Duration of a full turn.
  turnMs?: number;
};

// Rays turning slowly behind a highlighted avatar. Rotated with the native
// driver, so it stays smooth on TV.
export default function SunRays({ size, color, opacity = 0.5, turnMs = 40000 }: Props) {
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: turnMs, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin, turnMs]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.Image
      source={RAYS}
      fadeDuration={0}
      style={[styles.rays, { width: size, height: size, opacity, tintColor: color, transform: [{ rotate }] }]}
    />
  );
}

const styles = StyleSheet.create({
  rays: {
    position: 'absolute',
  },
});
