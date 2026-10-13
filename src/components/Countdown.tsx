import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import { playSfx, stopSfx } from '@/audio/sounds';
import { colors, s } from '@/theme';

type Props = {
  // Server time at which the question closes.
  endsAt: string;
  onEnd?: () => void;
};

// The tick-tock sound lasts exactly this long and ends with the timer.
const TICK_SECONDS = 5;

// Display only: the server ends the question at `endsAt`.
export default function Countdown({ endsAt, onEnd }: Props) {
  const [seconds] = useState(() => Math.max(0, Math.ceil((Date.parse(endsAt) - Date.now()) / 1000)));
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onEnd?.();
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onEnd]);

  useEffect(() => {
    if (remaining === TICK_SECONDS && seconds > TICK_SECONDS) void playSfx('tick');
    if (remaining === 0) void playSfx('time-up');
  }, [remaining, seconds]);

  // Leaving early (the host reveals the answer) cuts the tick-tock.
  useEffect(() => () => stopSfx('tick'), []);

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
