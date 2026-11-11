import { useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '@/components/AppText';
import AvatarMedia, { type Delays } from '@/components/AvatarMedia';
import FocusableButton, { ROUND_RING } from '@/components/FocusableButton';
import LoadingScreen from '@/components/LoadingScreen';
import Pop, { popOpacity, usePop } from '@/components/Pop';
import Screen from '@/components/Screen';
import SunRays from '@/components/SunRays';
import type { SfxName } from '@/audio/sounds';
import { avatarSource } from '@/game/avatars';
import { avatarVideo } from '@/game/avatarVideos';
import { playerName, useGame } from '@/game/GameProvider';
import { roundAwardsToShow } from '@/game/rules';
import type { Award, AwardId } from '@/game/types';
import { useScreenSfx } from '@/hooks/useScreenSfx';
import { colors, fonts, s, safeArea } from '@/theme';

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

// When a page opens, its elements pop in one after the other: title,
// subtitle, avatar, points badge, name, then the next button.
const POP_STAGGER_MS = 130;
const POP_DELAY = {
  title: 0,
  subtitle: POP_STAGGER_MS,
  avatar: 2 * POP_STAGGER_MS,
  badge: 3 * POP_STAGGER_MS,
  name: 4 * POP_STAGGER_MS,
  next: 5 * POP_STAGGER_MS,
};

// The reaction plays once the avatar has zoomed in, then again now and then.
const AWARD_VIDEO_DELAYS: Delays = {
  first: [1000, 1000],
  pause: [7000, 10000],
};

// TV screen 6: carousel of the round's awards, one award at a time.
// Laid out explicitly: the award's title and subtitle centred in the band above
// the avatar, the avatar (with its points badge) and the player's name below,
// and a round "next" button in the bottom-right corner. No page count: the
// screen just moves on from one award to the next.
export default function TvAwards() {
  const { t } = useTranslation();
  const { view, next: advance } = useGame();
  const insets = useSafeAreaInsets();
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
    <Screen style={styles.screen}>
      {/* Back out to the whole screen: the positions below are measured from its edges. */}
      <View
        style={[
          styles.fill,
          {
            top: -insets.top,
            bottom: -insets.bottom,
            left: -insets.left,
            right: -insets.right,
          },
        ]}
      >
        {award ? (
          <AwardPage
            key={index}
            title={t(`awards.${award.id}.label`)}
            subtitle={t(`awards.${award.id}.subtitle`)}
            name={playerName(view, award.playerId)}
            avatar={view.players.find((p) => p.id === award.playerId)?.avatar}
            mood={AWARD_MOOD[award.id]}
            points={award.points}
          />
        ) : (
          <View style={[styles.fill, styles.empty]}>
            <AppText variant="display">{t('awards.none')}</AppText>
          </View>
        )}
        <Pop key={index} delay={POP_DELAY.next} style={styles.next}>
          <FocusableButton
            variant="round"
            icon="arrow-forward"
            label={isLast ? t('awards.continue') : t('awards.next')}
            onPress={next}
            hasTVPreferredFocus
          />
        </Pop>
      </View>
    </Screen>
  );
}

type PageProps = {
  title: string;
  subtitle: string;
  name: string;
  avatar?: string;
  mood: Mood;
  points: number;
};

// One award. Each page remounts (keyed by index), so its entrance replays.
function AwardPage({ title, subtitle, name, avatar, mood, points }: PageProps) {
  // The rays fade in with the avatar; the badge pops on its own, tilted.
  const rays = usePop(POP_DELAY.avatar);
  const badge = usePop(POP_DELAY.badge);

  // The screen diagonal: the corners stay covered while the rays turn,
  // and the fade reaches zero around the edges of the screen.
  const { width, height } = useWindowDimensions();
  const raysSize = Math.hypot(width, height);
  const badgeScale = badge.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });
  const still = avatar ? avatarSource(avatar) : undefined;
  const video = avatar ? avatarVideo(avatar, mood) : undefined;

  return (
    <View style={styles.fill}>
      {/* A full-screen layer centred on the screen's centre (where the avatar is),
          whatever the content. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.rays,
          {
            left: (width - raysSize) / 2,
            top: (height - raysSize) / 2,
            opacity: popOpacity(rays),
          },
        ]}
      >
        <SunRays size={raysSize} color={colors.text} opacity={RAYS_OPACITY} />
      </Animated.View>

      <View style={styles.header}>
        <Pop delay={POP_DELAY.title}>
          <AppText variant="display" style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
        </Pop>
        <Pop delay={POP_DELAY.subtitle}>
          <AppText style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </AppText>
        </Pop>
      </View>

      <View style={styles.winner}>
        <Pop delay={POP_DELAY.avatar} style={styles.avatarGlow}>
          <View style={styles.avatarCircle}>
            <AvatarMedia still={still} video={video} delays={AWARD_VIDEO_DELAYS} />
          </View>
          {points !== 0 ? (
            // Bonnet d'âne is worth no points: no badge, the subtitle says why.
            <Animated.View
              style={[
                styles.badge,
                points > 0 ? styles.gain : styles.loss,
                {
                  opacity: popOpacity(badge),
                  transform: [{ rotate: '8deg' }, { scale: badgeScale }],
                },
              ]}
            >
              <AppText style={styles.badgeText}>{points > 0 ? `+${points}` : `−${Math.abs(points)}`}</AppText>
            </Animated.View>
          ) : null}
        </Pop>
        <Pop delay={POP_DELAY.name}>
          <AppText variant="display" style={styles.name} numberOfLines={1}>
            {name}
          </AppText>
        </Pop>
      </View>
    </View>
  );
}

// Positions in the 960×540 canvas, from the top of the screen.
// The avatar circle is centred on the screen.
const AVATAR_SIZE = s(220);
const AVATAR_CENTER_Y = s(270);
const AVATAR_TOP = AVATAR_CENTER_Y - AVATAR_SIZE / 2;

const styles = StyleSheet.create({
  // No padding: the page lays itself out over the whole screen.
  screen: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  // Edge to edge: the positions below are absolute and keep to the TV safe area themselves.
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rays: {
    position: 'absolute',
  },
  // Title and subtitle centred as one group between the safe area's top and the avatar.
  header: {
    position: 'absolute',
    top: safeArea.vertical,
    height: AVATAR_TOP - safeArea.vertical,
    left: safeArea.horizontal,
    right: safeArea.horizontal,
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(6),
  },
  title: {
    fontSize: s(40),
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: s(17),
    color: colors.textMuted,
    textAlign: 'center',
  },
  winner: {
    position: 'absolute',
    top: AVATAR_TOP,
    left: safeArea.horizontal,
    right: safeArea.horizontal,
    alignItems: 'center',
    gap: s(14),
  },
  // Carries the soft white glow: a shadow is clipped on the circle itself,
  // which hides the overflowing video. Not drawn on Android.
  avatarGlow: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.seat,
    shadowColor: colors.text,
    shadowOpacity: 0.1,
    shadowRadius: s(60),
    shadowOffset: { width: 0, height: 0 },
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
  name: {
    textAlign: 'center',
  },
  // Overlaps the avatar's top-right edge, tilted like a sticker.
  badge: {
    position: 'absolute',
    top: s(-6),
    right: s(-46),
    paddingHorizontal: s(16),
    borderRadius: s(999),
    borderWidth: s(4),
    borderColor: colors.text,
  },
  gain: {
    backgroundColor: colors.success,
  },
  loss: {
    backgroundColor: colors.danger,
  },
  badgeText: {
    fontFamily: fonts.display,
    fontSize: s(44),
  },
  // The disc sits 48 from the right and 30 from the bottom; its focus ring around it.
  next: {
    position: 'absolute',
    right: s(48) - ROUND_RING,
    bottom: s(30) - ROUND_RING,
  },
});
