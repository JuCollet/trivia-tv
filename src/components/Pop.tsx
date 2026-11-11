import { useEffect, useState, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

// Gap between two elements that pop one after the other.
export const POP_STAGGER_MS = 130;

// Springs from 0 to 1 after `delay`, with a slight overshoot. Native driver,
// so it stays smooth on TV. The delay is read once, on mount: the entrance
// never replays on a later render. A `null` delay skips the entrance and
// starts at 1, for an element that is already on screen.
export function usePop(delay: number | null) {
  const [start] = useState(delay);
  const [value] = useState(() => new Animated.Value(start === null ? 1 : 0));
  useEffect(() => {
    if (start === null) return;
    const animation = Animated.spring(value, {
      toValue: 1,
      delay: start,
      friction: 6,
      tension: 90,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [value, start]);
  return value;
}

export const popOpacity = (value: Animated.Value) =>
  value.interpolate({
    inputRange: [0, 0.6],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

// Fades in and grows from 0.6 to full size, overshooting a little.
export default function Pop({
  delay,
  style,
  children,
}: {
  delay: number | null;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const value = usePop(delay);
  const scale = value.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });
  return (
    <Animated.View style={[style, { opacity: popOpacity(value), transform: [{ scale }] }]}>{children}</Animated.View>
  );
}
