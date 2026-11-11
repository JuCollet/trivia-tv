import { useEffect, useState, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

// Springs from 0 to 1 after `delay`, with a slight overshoot. Native driver,
// so it stays smooth on TV.
export function usePop(delay: number) {
  const [value] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation = Animated.spring(value, {
      toValue: 1,
      delay,
      friction: 6,
      tension: 90,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [value, delay]);
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
  delay: number;
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
