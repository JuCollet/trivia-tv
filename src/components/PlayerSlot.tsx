import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import type { Player } from '@/game/types';
import { colors, fonts, radius, s, spacing } from '@/theme';

type Props =
  | {
      player: Player;
      color: string;
      isHost: boolean;
      // Themes each player has to enter: one per round.
      themesNeeded: number;
      // Smaller avatar when the room fills both rows.
      compact?: boolean;
    }
  | { player?: undefined; hint?: boolean };

// Lobby grid cell: a joined player with their theme status, or a free seat.
export default function PlayerSlot(props: Props) {
  const { t } = useTranslation();
  if (!props.player) {
    return (
      <View style={[styles.slot, styles.empty]}>
        {props.hint ? (
          <>
            <Ionicons name="phone-portrait-outline" size={s(22)} color={colors.highlight} />
            <AppText style={styles.hint}>{t('slot.scan')}</AppText>
          </>
        ) : null}
      </View>
    );
  }

  const { player, color, isHost, themesNeeded, compact } = props;
  const avatarSize = compact ? s(34) : s(50);
  const entered = Math.min(player.themesEntered, themesNeeded);
  const ready = entered >= themesNeeded;

  return (
    <View style={[styles.slot, styles.filled, compact && styles.filledCompact]}>
      <View>
        <View
          style={[
            styles.avatar,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, backgroundColor: color },
          ]}
        >
          <AppText variant="display" style={[styles.initial, { fontSize: avatarSize / 2 }]}>
            {player.name.charAt(0).toUpperCase()}
          </AppText>
        </View>
        {isHost ? (
          <View style={styles.hostBadge}>
            <AppText style={styles.hostText}>{t('slot.host')}</AppText>
          </View>
        ) : null}
      </View>
      <AppText style={styles.name} numberOfLines={1}>
        {player.name}
      </AppText>
      <View style={[styles.pill, { backgroundColor: ready ? colors.ready : colors.accent }]}>
        <Ionicons name={ready ? 'checkmark' : 'pencil'} size={s(11)} color={colors.onBright} />
        <AppText style={styles.pillText}>{ready ? t('slot.ready') : t('slot.themes', { entered, needed: themesNeeded })}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: s(1.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
  },
  filledCompact: {
    paddingVertical: spacing.xs,
    gap: s(2),
  },
  empty: {
    minHeight: s(40),
    gap: spacing.xs,
    borderStyle: 'dashed',
    borderColor: colors.panelBorder,
  },
  hint: {
    fontFamily: fonts.bodySemiBold,
    color: colors.highlight,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.onBright,
  },
  hostBadge: {
    position: 'absolute',
    top: -s(6),
    right: -s(22),
    paddingHorizontal: s(5),
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
  },
  hostText: {
    fontFamily: fonts.bodyBold,
    fontSize: s(10),
    color: colors.onBright,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: s(16),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(3),
    paddingHorizontal: spacing.sm,
    paddingVertical: s(2),
    borderRadius: s(12),
  },
  pillText: {
    fontFamily: fonts.bodyBold,
    fontSize: s(11),
    color: colors.onBright,
  },
});
