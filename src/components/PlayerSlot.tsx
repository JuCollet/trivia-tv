import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import AvatarMedia from './AvatarMedia';
import { avatarSource } from '@/game/avatars';
import { avatarVideo } from '@/game/avatarVideos';
import { colors, fonts, s } from '@/theme';

const READY_BADGE = require('../../assets/images/status/ready.png');
const WAITING_BADGE = require('../../assets/images/status/waiting.png');

export type LobbyPlayer = {
  id: string;
  name: string;
  avatar: string;
  // One theme entered per round.
  ready: boolean;
  connected: boolean;
};

type Props = { size: number } & ({ player: LobbyPlayer } | { player?: undefined; hint?: boolean });

// Lobby seat: a round avatar ringed in white, the player's name on a tilted
// pill over its bottom edge, and a status badge (check once their themes are
// in, dots while they still type them). A free seat is a dashed circle; the
// first one invites the next player to scan the code.
export default function PlayerSlot(props: Props) {
  const { t } = useTranslation();
  const { size } = props;
  const circle = { width: size, height: size, borderRadius: size / 2 };

  if (!props.player) {
    return (
      <View style={[styles.slot, { width: size }]}>
        <View style={[styles.free, circle, props.hint && styles.hintCircle]}>
          {props.hint ? <Ionicons name="phone-portrait-outline" size={s(28)} color={colors.highlight} /> : null}
        </View>
        <View style={[styles.pill, styles.hintPill, !props.hint && styles.hidden]}>
          <AppText style={styles.name} numberOfLines={1}>
            {t('slot.scan')}
          </AppText>
        </View>
      </View>
    );
  }

  const { player } = props;
  const source = avatarSource(player.avatar);
  const video = avatarVideo(player.avatar, 'neutral');
  const badge = Math.round(size * 0.38);
  return (
    <View style={[styles.slot, { width: size }, !player.connected && styles.disconnected]}>
      <View style={[styles.seat, circle]}>
        <View style={[styles.face, { borderRadius: size / 2 }]}>
          {source || video ? (
            <AvatarMedia still={source} video={video} size="84%" />
          ) : (
            <AppText variant="display" style={{ fontSize: size / 2.4 }}>
              {player.name.charAt(0).toUpperCase()}
            </AppText>
          )}
        </View>
        <Image
          source={player.ready ? READY_BADGE : WAITING_BADGE}
          style={[styles.badge, { width: badge, height: badge }]}
        />
      </View>
      <View style={styles.pill}>
        <AppText style={styles.name} numberOfLines={1}>
          {player.name}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
  },
  seat: {
    backgroundColor: colors.seat,
    borderWidth: s(4),
    borderColor: colors.text,
  },
  // Clips the avatar to the circle; the badge stays outside of it.
  face: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -s(8),
    bottom: -s(4),
  },
  free: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: s(2.5),
    borderStyle: 'dashed',
    borderColor: colors.freeSeat,
    backgroundColor: colors.freeSeatFill,
  },
  hintCircle: {
    borderColor: colors.highlight,
    backgroundColor: colors.seatHint,
  },
  // Overlaps the bottom of the circle, slightly tilted like the award badges.
  pill: {
    marginTop: -s(10),
    maxWidth: '118%',
    paddingHorizontal: s(12),
    paddingVertical: s(1),
    borderRadius: s(12),
    backgroundColor: colors.text,
    transform: [{ rotate: '-3deg' }],
  },
  hintPill: {
    backgroundColor: colors.highlight,
  },
  hidden: {
    opacity: 0,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: s(16),
    lineHeight: s(22),
    color: colors.onBright,
  },
  // Faded, so the player still reads as there but away.
  disconnected: {
    opacity: 0.6,
  },
});
