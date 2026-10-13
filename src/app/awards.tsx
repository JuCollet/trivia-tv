import { useEffect, useState } from 'react';
import { Animated, Easing, type ImageSourcePropType, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppText from '@/components/AppText';
import FocusableButton from '@/components/FocusableButton';
import LoadingScreen from '@/components/LoadingScreen';
import Screen from '@/components/Screen';
import type { SfxName } from '@/audio/sounds';
import { playerName, useGame } from '@/game/GameProvider';
import { roundAwardsToShow } from '@/game/rules';
import type { Award, AwardId } from '@/game/types';
import { useScreenSfx } from '@/hooks/useScreenSfx';
import { colors, radius, s, spacing } from '@/theme';

const AWARD_SFX: Record<AwardId, SfxName> = {
  plusViteQueSonOmbre: 'steal',
  outsider: 'award',
  seulContreTous: 'award',
  pasMonTruc: 'fail',
  bonnetDane: 'fail',
};

const AWARD_IMAGES: Record<AwardId, ImageSourcePropType> = {
  plusViteQueSonOmbre: require('../../assets/images/awards/plusViteQueSonOmbre.png'),
  outsider: require('../../assets/images/awards/outsider.png'),
  seulContreTous: require('../../assets/images/awards/seulContreTous.png'),
  pasMonTruc: require('../../assets/images/awards/pasMonTruc.png'),
  bonnetDane: require('../../assets/images/awards/bonnetDane.png'),
};

// TV screen 6: carousel of the round's awards, one award at a time.
export default function TvAwards() {
  const { t } = useTranslation();
  const { view, next: advance } = useGame();
  // The server uses the same award ids as the TV.
  const awards = roundAwardsToShow((view?.roundEnd?.awards ?? []) as Award[]);
  const [index, setIndex] = useState(0);
  const award = awards[index];
  const isLast = index >= awards.length - 1;
  // `index` replays the sound when two awards in a row share it.
  useScreenSfx(award ? AWARD_SFX[award.id] : null, 1, index);

  if (!view?.roundEnd) return <LoadingScreen />;

  const next = () => (isLast ? advance() : setIndex((i) => i + 1));

  return (
    <Screen centered>
      <AppText variant="title" muted>
        {t('awards.roundEnd')}
      </AppText>

      {award ? (
        <View key={index} style={styles.card}>
          <Trophy source={AWARD_IMAGES[award.id]} />
          <View style={styles.details}>
            <AppText variant="display">{t(`awards.${award.id}.label`)}</AppText>
            <AppText variant="hero">{playerName(view, award.playerId)}</AppText>
            {award.points !== 0 ? (
              <AppText variant="display" style={award.points > 0 ? styles.gain : styles.loss}>
                {award.points > 0 ? `+${award.points}` : award.points}
              </AppText>
            ) : null}
            <AppText muted style={styles.description}>
              {t(`awards.${award.id}.description`)}
            </AppText>
          </View>
        </View>
      ) : (
        <AppText variant="display">{t('awards.none')}</AppText>
      )}

      <View style={styles.dots}>
        {awards.map((a, i) => (
          <View key={`${a.id}-${a.playerId}`} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <FocusableButton label={isLast ? t('awards.continue') : t('awards.next')} onPress={next} hasTVPreferredFocus />
    </Screen>
  );
}

// Slight zoom-in when a page opens. Each page remounts (keyed by index), so it replays.
function Trophy({ source }: { source: ImageSourcePropType }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  return (
    <Animated.Image
      source={source}
      style={[styles.trophy, { opacity: progress, transform: [{ scale }] }]}
      resizeMode="contain"
      fadeDuration={0}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    width: '80%',
  },
  trophy: {
    width: s(200),
    height: s(200),
  },
  details: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.md,
  },
  gain: {
    color: colors.success,
  },
  loss: {
    color: colors.danger,
  },
  description: {
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: s(10),
    height: s(10),
    borderRadius: s(5),
    backgroundColor: colors.surfaceRaised,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
});
