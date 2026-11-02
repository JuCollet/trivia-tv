import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { playSfx, stopSfx } from '@/audio/sounds';
import AppText from '@/components/AppText';
import FocusableButton from '@/components/FocusableButton';
import Screen from '@/components/Screen';
import { DECOY_THEMES } from '@/game/decoyThemes';
import type { Language } from '@/game/types';
import { colors, fonts, radius, s, spacing } from '@/theme';

type Props = {
  // Null while Claude is still generating the final question: the reel spins until it arrives.
  theme: string | null;
  // Themes already played in the game, mixed with fake ones on the reel.
  playedThemes: string[];
  language: Language;
  onGo: () => void;
};

type Stage = 'intro' | 'spinning' | 'landed' | 'done';

const POOL_SIZE = 10;
// The reel goes through the pool this many times before stopping on the mystery theme.
const LOOPS = 3;
const ITEM_HEIGHT = s(84);
const WINDOW_WIDTH = s(520);
const FRAME = s(16);
const STAMP_AT_MS = 1_500;
const SPIN_AT_MS = 2_500;
// Even when the theme is already known, the reel spins at full speed for a moment before slowing down.
const MIN_FREE_SPIN_MS = 1_000;
const ITEMS_PER_SECOND = 14;
const DECELERATION_MS = 4_500;
const BUTTON_DELAY_MS = 1_000;
// One click per theme passing in the window, at most this often.
const CLICK_MIN_INTERVAL_MS = 70;
const BULBS_PER_SIDE = 10;
const BULBS_PER_END = 2;

// TV announcement of the mystery final question: a slot machine that spins through themes and stops on it.
export default function FinalReveal({ theme, playedThemes, language, onGo }: Props) {
  const { t } = useTranslation();
  // Fixed when the screen opens, so that the reel does not change while it spins.
  const [pool] = useState(() => buildPool(playedThemes, language));
  const [stage, setStage] = useState<Stage>('intro');
  const [spinStartedAt, setSpinStartedAt] = useState(0);
  const [title] = useState(() => new Animated.Value(0));
  const [stamp] = useState(() => new Animated.Value(0));
  const [reel] = useState(() => new Animated.Value(0));
  const [offset] = useState(() => new Animated.Value(0));
  const [freeSpin] = useState(() =>
    Animated.loop(
      Animated.timing(offset, {
        toValue: pool.length * ITEM_HEIGHT,
        duration: (pool.length * 1_000) / ITEMS_PER_SECOND,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ),
  );
  const bulbsOn = useBlink(stage === 'intro' ? null : stage === 'spinning' ? 450 : 130);

  // Intro: title, ×2 stamp, then the reel starts.
  useEffect(() => {
    void playSfx('finale-intro');
    Animated.spring(title, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    const timers = [
      setTimeout(() => {
        void playSfx('bonus');
        Animated.spring(stamp, { toValue: 1, friction: 4, useNativeDriver: true }).start();
      }, STAMP_AT_MS),
      setTimeout(() => {
        Animated.timing(reel, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        freeSpin.start();
        setSpinStartedAt(Date.now());
        setStage('spinning');
      }, SPIN_AT_MS),
    ];
    return () => {
      timers.forEach(clearTimeout);
      freeSpin.stop();
      stopSfx('finale-intro');
      stopSfx('theme-reveal');
    };
  }, [title, stamp, reel, freeSpin]);

  // A click for each theme passing in the window, slowing down with the reel.
  useEffect(() => {
    let lastIndex = 0;
    let lastClick = 0;
    const id = offset.addListener(({ value }) => {
      const index = Math.round(value / ITEM_HEIGHT);
      if (index === lastIndex) return;
      lastIndex = index;
      const now = Date.now();
      if (now - lastClick < CLICK_MIN_INTERVAL_MS) return;
      lastClick = now;
      void playSfx('option', 0.4);
    });
    return () => offset.removeListener(id);
  }, [offset]);

  // Once the theme is known, the reel slows down and stops on it.
  useEffect(() => {
    if (stage !== 'spinning' || !theme) return;
    const delay = Math.max(0, spinStartedAt + MIN_FREE_SPIN_MS - Date.now());
    const start = setTimeout(() => {
      freeSpin.stop();
      offset.stopAnimation(() => {
        // The free spin loops over the first pool: the mystery theme comes after LOOPS more pools.
        Animated.timing(offset, {
          toValue: LOOPS * pool.length * ITEM_HEIGHT,
          duration: DECELERATION_MS,
          easing: Easing.out(Easing.poly(4)),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished) return;
          void playSfx('theme-reveal');
          setStage('landed');
        });
      });
    }, delay);
    return () => clearTimeout(start);
  }, [stage, theme, spinStartedAt, freeSpin, offset, pool.length]);

  // The host gets the button once the theme had time to sink in.
  useEffect(() => {
    if (stage !== 'landed') return;
    const timer = setTimeout(() => setStage('done'), BUTTON_DELAY_MS);
    return () => clearTimeout(timer);
  }, [stage]);

  const strip = Array.from({ length: LOOPS }, () => pool).flat();
  const won = stage === 'landed' || stage === 'done';

  return (
    <Screen centered style={styles.screen}>
      <Animated.View
        style={[
          styles.stamp,
          { transform: [{ rotate: '-12deg' }, { scale: stamp }] },
        ]}
      >
        <AppText variant="display" style={styles.stampText}>
          ×2
        </AppText>
      </Animated.View>

      <Animated.View
        style={{
          opacity: title,
          transform: [{ scale: title.interpolate({ inputRange: [0, 1], outputRange: [1.6, 1] }) }],
        }}
      >
        <AppText variant="hero" style={styles.title}>
          {t('finalReveal.title')}
        </AppText>
      </Animated.View>

      <Animated.View style={[styles.machine, won && styles.machineWon, { opacity: reel }]}>
        <Bulbs on={bulbsOn} />
        <View style={styles.window}>
          <Animated.View style={{ transform: [{ translateY: Animated.multiply(offset, -1) }] }}>
            {strip.map((item, index) => (
              <ReelItem key={index} label={item} />
            ))}
            <ReelItem label={theme ?? ''} />
          </Animated.View>
          <View style={[styles.shade, styles.shadeTop]} />
          <View style={[styles.shade, styles.shadeBottom]} />
        </View>
        <View style={[styles.pointer, styles.pointerLeft]} />
        <View style={[styles.pointer, styles.pointerRight]} />
      </Animated.View>

      <View style={styles.footer}>
        {stage === 'done' ? (
          <FocusableButton label={t('theme.go')} onPress={onGo} sound="start" hasTVPreferredFocus />
        ) : (
          <AppText muted>{stage === 'spinning' && !theme ? t('finalReveal.searching') : ' '}</AppText>
        )}
      </View>
    </Screen>
  );
}

function ReelItem({ label }: { label: string }) {
  return (
    <View style={styles.item}>
      <AppText numberOfLines={1} adjustsFontSizeToFit style={styles.itemText}>
        {label}
      </AppText>
    </View>
  );
}

// Light bulbs around the machine, every other one lit in turn.
function Bulbs({ on }: { on: boolean }) {
  const width = WINDOW_WIDTH + 2 * FRAME;
  const height = ITEM_HEIGHT + 2 * FRAME;
  const positions: { left: number; top: number }[] = [];
  for (let i = 0; i < BULBS_PER_SIDE; i++) {
    const left = ((i + 0.5) / BULBS_PER_SIDE) * width;
    positions.push({ left, top: FRAME / 2 }, { left, top: height - FRAME / 2 });
  }
  for (let i = 0; i < BULBS_PER_END; i++) {
    const top = ((i + 1) / (BULBS_PER_END + 1)) * height;
    positions.push({ left: FRAME / 2, top }, { left: width - FRAME / 2, top });
  }
  return (
    <>
      {positions.map((position, index) => (
        <View
          key={index}
          style={[
            styles.bulb,
            { left: position.left - BULB / 2, top: position.top - BULB / 2 },
            (index % 2 === 0) === on && styles.bulbOn,
          ]}
        />
      ))}
    </>
  );
}

// Toggles every `intervalMs`, or stays off when null.
function useBlink(intervalMs: number | null) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (intervalMs === null) return;
    const timer = setInterval(() => setOn((value) => !value), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return on;
}

// The game's own themes first, completed with fake ones, in a random order.
function buildPool(playedThemes: string[], language: Language): string[] {
  const played = shuffle(playedThemes).slice(0, POOL_SIZE / 2);
  const decoys = shuffle(DECOY_THEMES[language].filter((decoy) => !played.includes(decoy)));
  return shuffle([...played, ...decoys.slice(0, POOL_SIZE - played.length)]);
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const BULB = s(10);
const POINTER = s(14);

const styles = StyleSheet.create({
  screen: {
    gap: spacing.xl,
  },
  title: {
    textAlign: 'center',
    textShadowColor: colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: s(16),
  },
  stamp: {
    position: 'absolute',
    top: s(20),
    right: s(40),
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  stampText: {
    color: colors.onBright,
  },
  machine: {
    padding: FRAME,
    borderRadius: radius.lg,
    borderWidth: s(3),
    borderColor: colors.accent,
    backgroundColor: colors.slotFrame,
  },
  machineWon: {
    borderColor: colors.text,
  },
  window: {
    width: WINDOW_WIDTH,
    height: ITEM_HEIGHT,
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: colors.slotWindow,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  itemText: {
    fontFamily: fonts.display,
    fontSize: s(36),
    color: colors.slotText,
  },
  // Darkens the top and bottom of the window, so that the reel looks curved.
  shade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: s(14),
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  shadeTop: {
    top: 0,
  },
  shadeBottom: {
    bottom: 0,
  },
  pointer: {
    position: 'absolute',
    top: FRAME + ITEM_HEIGHT / 2 - POINTER,
    width: 0,
    height: 0,
    borderTopWidth: POINTER,
    borderBottomWidth: POINTER,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  pointerLeft: {
    left: -s(4),
    borderLeftWidth: POINTER * 1.3,
    borderLeftColor: colors.slotPointer,
  },
  pointerRight: {
    right: -s(4),
    borderRightWidth: POINTER * 1.3,
    borderRightColor: colors.slotPointer,
  },
  bulb: {
    position: 'absolute',
    width: BULB,
    height: BULB,
    borderRadius: BULB / 2,
    backgroundColor: colors.bulbOff,
  },
  bulbOn: {
    backgroundColor: colors.accent,
  },
  footer: {
    height: s(56),
    justifyContent: 'center',
  },
});
