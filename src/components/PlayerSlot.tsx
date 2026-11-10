import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { avatarSource } from '@/game/avatars';
import { colors, fonts, s, spacing } from '@/theme';

export type LobbyPlayer = {
  id: string;
  name: string;
  avatar: string;
  // One theme entered per round.
  ready: boolean;
  connected: boolean;
};

type Props = { size: number } & ({ player: LobbyPlayer } | { player?: undefined; hint?: boolean });

// Lobby seat: a round avatar with the player's name, or a free seat at half
// opacity. The ring is orange while the player still types their themes, and
// the avatar sits on green once they are ready.
export default function PlayerSlot(props: Props) {
  const { t } = useTranslation();
  const { size } = props;
  const circle = { width: size, height: size, borderRadius: size / 2 };

  if (!props.player) {
    return (
      <View style={[styles.slot, { width: size }]}>
        <View style={[styles.circle, styles.empty, circle]}>
          {props.hint ? <Ionicons name="phone-portrait-outline" size={s(26)} color={colors.text} /> : null}
        </View>
        <AppText style={[styles.name, styles.hint]} numberOfLines={1}>
          {props.hint ? t('slot.scan') : ' '}
        </AppText>
      </View>
    );
  }

  const { player } = props;
  const source = avatarSource(player.avatar);
  return (
    <View style={[styles.slot, { width: size }, !player.connected && styles.disconnected]}>
      <View style={[styles.circle, circle, player.ready ? styles.ready : styles.waiting]}>
        {source ? (
          <Image source={source} style={styles.avatar} resizeMode="contain" />
        ) : (
          <AppText variant="display" style={{ fontSize: size / 2.4 }}>
            {player.name.charAt(0).toUpperCase()}
          </AppText>
        )}
      </View>
      <AppText style={styles.name} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {player.name}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: s(5),
  },
  empty: {
    backgroundColor: colors.seat,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  waiting: {
    backgroundColor: colors.seat,
    borderColor: colors.notReady,
  },
  ready: {
    backgroundColor: colors.ready,
    borderColor: colors.ready,
  },
  avatar: {
    width: '92%',
    height: '92%',
  },
  // Lighter than a free seat's 50%, so the player still reads as there.
  disconnected: {
    opacity: 0.7,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: s(20),
    maxWidth: '120%',
  },
  hint: {
    color: colors.highlight,
  },
});
