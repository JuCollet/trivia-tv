import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppText from '@/components/AppText';
import AvatarMedia, { type Delays } from '@/components/AvatarMedia';
import FocusableButton from '@/components/FocusableButton';
import LoadingScreen from '@/components/LoadingScreen';
import Screen from '@/components/Screen';
import SunRays from '@/components/SunRays';
import type { SfxName } from '@/audio/sounds';
import { avatarSource } from '@/game/avatars';
import { avatarVideo } from '@/game/avatarVideos';
import { playerName, useGame } from '@/game/GameProvider';
import { roundAwardsToShow } from '@/game/rules';
import type { Award, AwardId } from '@/game/types';
import { useScreenSfx } from '@/hooks/useScreenSfx';
import { colors, s, spacing } from '@/theme';

const AWARD_SFX: Record<AwardId, SfxName> = {
  plusViteQueSonOmbre: 'steal',
  outsider: 'award',
  seulContreTous: 'award',
  pasMonTruc: 'fail',
  bonnetDane: 'fail',
};

// Positive awards show the winner's happy animation, negative ones the sad (or angry) one.
type Mood = 'happy' | 'sad';
const AWARD_MOOD: Record<AwardId, Mood> = {
  plusViteQueSonOmbre: 'happy',
  outsider: 'happy',
  seulContreTous: 'happy',
  pasMonTruc: 'sad',
  bonnetDane: 'sad',
};

// Very discreet white rays over the whole screen, centred on the avatar and
// fading out towards the edges of the screen.
const RAYS_OPACITY = 0.13;

// The reaction plays once the avatar has zoomed in, then again now and then.
const AWARD_VIDEO_DELAYS: Delays = { first: [700, 700], pause: [7000, 10000] };

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

  // One column: who, their avatar, what it's worth, which award, and the button
  // at the bottom. The avatar leads; the points, in gold like the button, come
  // second; the award reads as a badge. No page count: the screen just moves on
  // from one award to the next.
  return (
    <Screen>
      <View style={styles.page}>
        {award ? (
          <View key={index} style={styles.column}>
            <AppText variant="display" style={styles.centered} numberOfLines={1}>
              {playerName(view, award.playerId)}
            </AppText>
            <AwardAvatar avatar={view.players.find((p) => p.id === award.playerId)?.avatar} mood={AWARD_MOOD[award.id]} />
            <View style={styles.result}>
              {award.points !== 0 ? (
                <AppText variant="hero" style={award.points > 0 ? styles.gain : styles.loss}>
                  {award.points > 0 ? `+${award.points}` : award.points}
                </AppText>
              ) : award.id === 'bonnetDane' ? (
                // The only award worth no points: show what earned it instead.
                <AppText variant="hero" style={styles.loss}>
                  {t('awards.bonnetDane.stat')}
                </AppText>
              ) : null}
              <View style={styles.badge}>
                <AppText variant="title" style={styles.centered}>
                  {t(`awards.${award.id}.label`)}
                </AppText>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.column}>
            <AppText variant="display">{t('awards.none')}</AppText>
          </View>
        )}

        <FocusableButton label={isLast ? t('awards.continue') : t('awards.next')} onPress={next} hasTVPreferredFocus />
      </View>
    </Screen>
  );
}

// The winner's avatar, large, on slowly turning rays. Zooms in when a page
// opens: each page remounts (keyed by index), so it replays.
function AwardAvatar({ avatar, mood }: { avatar?: string; mood: Mood }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  // The screen diagonal: the corners stay covered while the rays turn,
  // and the fade reaches zero around the edges of the screen.
  const { width, height } = useWindowDimensions();
  const raysSize = Math.hypot(width, height);
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const still = avatar ? avatarSource(avatar) : undefined;
  const video = avatar ? avatarVideo(avatar, mood) : undefined;
  return (
    <Animated.View style={[styles.stage, { opacity: progress, transform: [{ scale }] }]}>
      <SunRays size={raysSize} color={colors.text} opacity={RAYS_OPACITY} />
      <View style={styles.avatarCircle}>
        <AvatarMedia still={still} video={video} delays={AWARD_VIDEO_DELAYS} />
      </View>
    </Animated.View>
  );
}

const AVATAR_SIZE = s(200);
const STAGE_SIZE = s(200);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.lg,
  },
  // Fills the space above the button and centres the award in it.
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  // Points and award name read as one block.
  result: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: s(999),
    borderWidth: s(2),
    borderColor: colors.panelBorder,
    backgroundColor: colors.panel,
  },
  // Drawn first among the column's children, so the rays spread behind the texts.
  stage: {
    zIndex: -1,
    width: STAGE_SIZE,
    height: STAGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: s(4),
    borderColor: colors.text,
    backgroundColor: colors.seat,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Gold like the button, rather than green, so the screen keeps two accent colours.
  gain: {
    color: colors.accent,
  },
  loss: {
    color: colors.danger,
  },
  centered: {
    textAlign: 'center',
  },
});
