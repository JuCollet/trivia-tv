import { Animated, Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '@/components/AppText';
import AvatarMedia, { type Delays } from '@/components/AvatarMedia';
import FocusableButton, { ROUND_RING, ROUND_SIZE } from '@/components/FocusableButton';
import LoadingScreen from '@/components/LoadingScreen';
import Pop, { popOpacity, usePop } from '@/components/Pop';
import Screen from '@/components/Screen';
import SunRays from '@/components/SunRays';
import { AWARD_IMAGES, AWARD_ORDER } from '@/game/awardImages';
import { avatarSource } from '@/game/avatars';
import { avatarVideo } from '@/game/avatarVideos';
import { useGame } from '@/game/GameProvider';
import type { Award, AwardId } from '@/game/types';
import { useScreenSfx } from '@/hooks/useScreenSfx';
import { colors, fonts, gradients, podiumSteps, s, safeArea } from '@/theme';

// Same discreet white rays as the awards screen, centred on the winner.
const RAYS_OPACITY = 0.13;

// The screen builds up: title, third step, second, first, then the ranking and the button.
const POP_STAGGER_MS = 130;
const POP_DELAY = {
  title: 0,
  steps: [4 * POP_STAGGER_MS, 3 * POP_STAGGER_MS, 2 * POP_STAGGER_MS],
  ranking: 6 * POP_STAGGER_MS,
  next: 7 * POP_STAGGER_MS,
};

// The winner celebrates once on its step, then again now and then.
const WINNER_VIDEO_DELAYS: Delays = {
  first: [1200, 1200],
  pause: [7000, 10000],
};

type Entry = { playerId: string; name: string; avatar: string; score: number };

// Thin spaces between thousands and a real minus sign. Written by hand: the
// TV's JavaScript engine does not format numbers for every locale.
function formatPoints(points: number) {
  const digits = String(Math.abs(points)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return points < 0 ? `−${digits}` : digits;
}

// The awards of one player over the whole game: one entry per kind, with how many.
function trophiesOf(awards: Award[], playerId: string) {
  const counts = new Map<AwardId, number>();
  for (const award of awards) {
    if (award.playerId === playerId) counts.set(award.id, (counts.get(award.id) ?? 0) + 1);
  }
  return AWARD_ORDER.filter((id) => counts.has(id)).map((id) => ({ id, count: counts.get(id) ?? 0 }));
}

// TV screen 7: final podium, after the mystery final question.
// Laid out explicitly over the whole screen: the winner's name as the title,
// the podium on the left (avatar above each step, rank and score on its face),
// the full ranking with the awards won in a card on the right, and the round
// "next" button of the awards screen in the bottom-right corner.
export default function TvFinale() {
  const { t } = useTranslation();
  const { view, gameAwards, newGame } = useGame();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  useScreenSfx('podium');
  if (!view?.podium) return <LoadingScreen />;

  // Ranked by the server, ties broken by correct answers then speed.
  const ranking: Entry[] = view.podium;
  const top = ranking.slice(0, 3);
  // Second on the left, winner in the middle, third on the right.
  const order = [1, 0, 2].filter((rank) => rank < top.length);

  // The podium is centred in the room left of the ranking card.
  const podiumWidth = order.length * STEP_WIDTH + (order.length - 1) * STEP_GAP;
  const cardLeft = width - CARD_MARGIN - CARD_WIDTH;
  const podiumCenter = (safeArea.horizontal + cardLeft - PODIUM_CARD_GAP) / 2;
  const podiumLeft = podiumCenter - podiumWidth / 2;

  // The rays turn around the centre of the winner's avatar, wherever its step is.
  const winnerX = podiumLeft + order.indexOf(0) * (STEP_WIDTH + STEP_GAP) + STEP_WIDTH / 2;
  const winnerY = height - STEP_HEIGHT[0] - AVATAR_GAP - PILL_BELOW - AVATAR_SIZE[0] / 2;
  // Twice the distance to the farthest corner: the corners stay covered while the rays turn.
  const raysSize = 2 * Math.hypot(Math.max(winnerX, width - winnerX), Math.max(winnerY, height - winnerY));

  // Rows shrink with the number of players, so the card never reaches the button.
  const rowHeight = Math.min(
    ROW_MAX_HEIGHT,
    Math.floor((CARD_MAX_HEIGHT - CARD_CHROME - (ranking.length - 1) * ROW_GAP) / ranking.length),
  );

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
        <LinearGradient colors={gradients.podiumBackdrop} locations={[0, 0.45, 1]} style={styles.fill} />
        <Rays size={raysSize} x={winnerX} y={winnerY} />

        <View style={[styles.header, { left: podiumCenter - HEADER_WIDTH / 2 }]}>
          <Pop delay={POP_DELAY.title}>
            <AppText variant="display" style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
              {t('finale.winner', { name: top[0]?.name ?? '?' })}
            </AppText>
          </Pop>
        </View>

        <View style={[styles.podium, { left: podiumLeft }]}>
          {order.map((rank) => (
            <Step
              key={top[rank].playerId}
              rank={rank}
              player={top[rank]}
              happy={top[rank].score === top[0].score}
              unit={t('finale.pointsUnit')}
            />
          ))}
        </View>

        <Pop delay={POP_DELAY.ranking} style={styles.card}>
          <AppText variant="display" style={styles.cardTitle}>
            {t('finale.ranking')}
          </AppText>
          <View style={styles.rows}>
            {ranking.map((player, index) => (
              <RankingRow
                key={player.playerId}
                rank={index + 1}
                player={player}
                trophies={trophiesOf(gameAwards, player.playerId)}
                height={rowHeight}
              />
            ))}
          </View>
        </Pop>

        {/* The phones follow the new game: everyone plays again without scanning. */}
        <Pop delay={POP_DELAY.next} style={styles.next}>
          <FocusableButton
            variant="round"
            icon="arrow-forward"
            label={t('common.newGame')}
            onPress={() => newGame()}
            sound="start"
            hasTVPreferredFocus
          />
        </Pop>
      </View>
    </Screen>
  );
}

function Rays({ size, x, y }: { size: number; x: number; y: number }) {
  const value = usePop(POP_DELAY.steps[0]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.rays, { left: x - size / 2, top: y - size / 2, opacity: popOpacity(value) }]}
    >
      <SunRays size={size} color={colors.text} opacity={RAYS_OPACITY} />
    </Animated.View>
  );
}

// One step of the podium with its player above. `rank` starts at 0. `happy` is true
// for the winner and anyone tied with them on points: everybody else is sad.
function Step({ rank, player, happy, unit }: { rank: number; player: Entry; happy: boolean; unit: string }) {
  const value = usePop(POP_DELAY.steps[rank]);
  // Rises from below the screen; the face runs past the bottom edge, so the
  // spring's overshoot never shows a gap under the step.
  const translateY = value.interpolate({ inputRange: [0, 1], outputRange: [s(80), 0] });
  const size = AVATAR_SIZE[rank];
  const { face, ink } = podiumSteps[rank];
  const still = avatarSource(player.avatar);
  // No clip for this avatar: AvatarMedia falls back to the still image.
  const video = avatarVideo(player.avatar, happy ? 'happy' : 'sad');

  return (
    <Animated.View style={[styles.step, { opacity: popOpacity(value), transform: [{ translateY }] }]}>
      <View style={[styles.avatarGlow, { width: size, height: size, borderRadius: size / 2 }]}>
        <View style={[styles.avatarCircle, { borderRadius: size / 2 }]}>
          <AvatarMedia still={still} video={video} delays={happy ? WINNER_VIDEO_DELAYS : undefined} size="84%" />
        </View>
      </View>
      <View style={styles.pill}>
        <AppText style={styles.pillText} numberOfLines={1}>
          {player.name}
        </AppText>
      </View>
      <View style={[styles.face, { height: STEP_HEIGHT[rank] + STEP_OVERFLOW }]}>
        <LinearGradient colors={face} locations={[0, 0.4, 1]} style={styles.fill} />
        <AppText style={[styles.rank, rank === 0 && styles.rankFirst, { color: ink }]}>{rank + 1}</AppText>
        <AppText style={[styles.score, { color: ink }]} numberOfLines={1}>
          {formatPoints(player.score)} <AppText style={[styles.unit, { color: ink }]}>{unit}</AppText>
        </AppText>
      </View>
    </Animated.View>
  );
}

type RowProps = {
  rank: number;
  player: Entry;
  trophies: { id: AwardId; count: number }[];
  height: number;
};

// One player of the ranking: rank, avatar, name, awards won during the game, score.
function RankingRow({ rank, player, trophies, height }: RowProps) {
  const compact = height < ROW_MAX_HEIGHT;
  const avatar = Math.min(s(28), height - s(4));
  const trophy = Math.min(s(30), height - s(4));
  const textStyle = compact ? styles.rowTextCompact : null;
  return (
    <View style={[styles.row, { height }]}>
      <AppText style={styles.rowRank}>{rank}</AppText>
      <View style={[styles.rowAvatar, { width: avatar, height: avatar, borderRadius: avatar / 2 }]}>
        <AvatarMedia still={avatarSource(player.avatar)} size="84%" />
      </View>
      <AppText style={[styles.rowName, textStyle]} numberOfLines={1}>
        {player.name}
      </AppText>
      <View style={styles.rowTrophies}>
        {trophies.map(({ id, count }) => (
          <View key={id} style={styles.rowTrophy}>
            <Image source={AWARD_IMAGES[id]} style={{ width: trophy, height: trophy }} resizeMode="contain" />
            {count > 1 ? <AppText style={styles.rowTrophyCount}>×{count}</AppText> : null}
          </View>
        ))}
      </View>
      <AppText style={[styles.rowScore, textStyle, player.score < 0 && styles.rowScoreNegative]} numberOfLines={1}>
        {formatPoints(player.score)}
      </AppText>
    </View>
  );
}

// Sizes in the 960×540 canvas. Steps and avatars by rank: first, second, third.
const STEP_WIDTH = s(156);
const STEP_GAP = s(14);
const STEP_HEIGHT = [s(258), s(196), s(148)];
// Extra face below the bottom edge of the screen.
const STEP_OVERFLOW = s(40);
const AVATAR_SIZE = [s(116), s(96), s(96)];
// The name pill overlaps the bottom of the avatar and hangs this far below it.
const PILL_HEIGHT = s(24);
const PILL_BELOW = s(12);
// Clear space between the name pill and the top of the step.
const AVATAR_GAP = s(22);
const HEADER_WIDTH = s(520);

// The ranking card keeps the same margin from the top and the right, and
// always stops above the round button.
const CARD_MARGIN = s(48);
const CARD_WIDTH = s(320);
const CARD_PADDING = s(12);
const CARD_TITLE_HEIGHT = s(34);
const PODIUM_CARD_GAP = s(24);
const NEXT_BOTTOM = s(30);
const CARD_MAX_HEIGHT = s(540) - CARD_MARGIN - (NEXT_BOTTOM + ROUND_SIZE + ROUND_RING + s(25));
const CARD_CHROME = 2 * CARD_PADDING + CARD_TITLE_HEIGHT;
const ROW_MAX_HEIGHT = s(38);
const ROW_GAP = s(4);

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
  rays: {
    position: 'absolute',
  },
  // Same size as the awards screen's title, centred above the podium.
  header: {
    position: 'absolute',
    top: s(50),
    width: HEADER_WIDTH,
    alignItems: 'center',
  },
  title: {
    fontSize: s(40),
    lineHeight: s(46),
    textAlign: 'center',
  },
  podium: {
    position: 'absolute',
    bottom: -STEP_OVERFLOW,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: STEP_GAP,
  },
  step: {
    width: STEP_WIDTH,
    alignItems: 'center',
  },
  // Carries the soft white glow: a shadow is clipped on the circle itself. Not drawn on Android.
  avatarGlow: {
    backgroundColor: colors.seat,
    shadowColor: colors.text,
    shadowOpacity: 0.12,
    shadowRadius: s(40),
    shadowOffset: { width: 0, height: 0 },
  },
  avatarCircle: {
    width: '100%',
    height: '100%',
    borderWidth: s(4),
    borderColor: colors.text,
    backgroundColor: colors.seat,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // The name on a tilted white pill over the bottom of the avatar, as in the lobby.
  pill: {
    height: PILL_HEIGHT,
    marginTop: PILL_BELOW - PILL_HEIGHT,
    marginBottom: AVATAR_GAP,
    maxWidth: STEP_WIDTH,
    paddingHorizontal: s(13),
    borderRadius: PILL_HEIGHT / 2,
    backgroundColor: colors.text,
    justifyContent: 'center',
    transform: [{ rotate: '-3deg' }],
  },
  pillText: {
    fontFamily: fonts.bodyBold,
    fontSize: s(17),
    lineHeight: s(22),
    color: colors.onBright,
  },
  // Flat: only the top corners are rounded, no depth.
  face: {
    width: STEP_WIDTH,
    borderTopLeftRadius: s(12),
    borderTopRightRadius: s(12),
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: s(14),
    gap: s(4),
  },
  // Engraved: darker than the face, with a light edge underneath.
  rank: {
    fontFamily: fonts.display,
    fontSize: s(74),
    lineHeight: s(78),
    textShadowColor: 'rgba(255, 255, 255, 0.45)',
    textShadowOffset: { width: 0, height: s(1.5) },
    textShadowRadius: 0,
  },
  rankFirst: {
    fontSize: s(92),
    lineHeight: s(96),
  },
  score: {
    fontFamily: fonts.bodyBold,
    fontSize: s(22),
    lineHeight: s(26),
  },
  unit: {
    fontFamily: fonts.bodySemiBold,
    fontSize: s(13),
    opacity: 0.8,
  },
  card: {
    position: 'absolute',
    top: CARD_MARGIN,
    right: CARD_MARGIN,
    width: CARD_WIDTH,
    padding: CARD_PADDING,
    borderRadius: s(22),
    borderWidth: s(1.5),
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  cardTitle: {
    height: CARD_TITLE_HEIGHT,
    fontSize: s(21),
    lineHeight: s(26),
    textAlign: 'center',
  },
  rows: {
    gap: ROW_GAP,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingLeft: s(6),
    paddingRight: s(10),
    borderRadius: s(12),
    backgroundColor: colors.chip,
  },
  rowRank: {
    width: s(20),
    textAlign: 'center',
    fontFamily: fonts.display,
    fontSize: s(17),
    color: colors.textMuted,
  },
  rowAvatar: {
    borderWidth: s(2),
    borderColor: colors.text,
    backgroundColor: colors.seat,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowName: {
    flex: 1,
    minWidth: s(48),
    fontFamily: fonts.bodySemiBold,
    fontSize: s(16),
  },
  rowTextCompact: {
    fontSize: s(15),
  },
  // Clipped rather than squeezing the name when a player collected every award.
  rowTrophies: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    overflow: 'hidden',
  },
  rowTrophy: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTrophyCount: {
    fontFamily: fonts.bodySemiBold,
    fontSize: s(11),
    color: colors.textMuted,
    marginLeft: s(-2),
    marginRight: s(2),
  },
  rowScore: {
    minWidth: s(52),
    textAlign: 'right',
    fontFamily: fonts.bodyBold,
    fontSize: s(16),
  },
  rowScoreNegative: {
    color: colors.scoreNegative,
  },
  // The disc sits 48 from the right and 30 from the bottom; its focus ring around it.
  next: {
    position: 'absolute',
    right: s(48) - ROUND_RING,
    bottom: NEXT_BOTTOM - ROUND_RING,
  },
});
