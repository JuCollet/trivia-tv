import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import { colors, s } from '@/theme';

type Props = {
  seconds: number;
  onEnd?: () => void;
};

// Local timer for the prototype. In game, the server is the source of truth.
export default function Countdown({ seconds, onEnd }: Props) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onEnd?.();
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onEnd]);

  return (
    <View style={[styles.circle, remaining <= 5 && styles.urgent]}>
      <AppText variant="display">{remaining}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: s(72),
    height: s(72),
    borderRadius: s(36),
    borderWidth: s(4),
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgent: {
    borderColor: colors.danger,
  },
});
