import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import AvatarMedia from './AvatarMedia';
import { avatarSource } from '@/game/avatars';
import { colors, fonts, s } from '@/theme';

type Props = {
  name: string;
  avatar?: string;
  // Points won (or lost) on the question.
  points: number;
  correct: boolean;
  // Diameter of the avatar circle.
  size: number;
};

// A player under the answer they picked: their avatar in a round seat (ringed
// in green when right), the name on a tilted pill like in the lobby, and the
// points won or lost.
export default function AnswerPlayer({ name, avatar, points, correct, size }: Props) {
  const still = avatar ? avatarSource(avatar) : undefined;
  const small = size < s(48);
  return (
    <View style={[styles.player, { width: answerPlayerWidth(size) }]}>
      <View
        style={[
          styles.seat,
          { width: size, height: size, borderRadius: size / 2 },
          small && styles.thinSeat,
          correct && styles.correctSeat,
        ]}
      >
        {still ? (
          <AvatarMedia still={still} size="84%" />
        ) : (
          <AppText variant="title" style={{ fontSize: size / 2.4 }}>
            {name.charAt(0).toUpperCase()}
          </AppText>
        )}
      </View>
      <View style={styles.pill}>
        <AppText style={[styles.name, small && styles.smallName]} numberOfLines={1}>
          {name}
        </AppText>
      </View>
      <AppText style={[styles.points, small && styles.smallPoints, pointsStyle(points)]}>{signed(points)}</AppText>
    </View>
  );
}

// Width of a player: room for the name pill on each side of the circle,
// narrower for small avatars so that more of them fit in a row.
export function answerPlayerWidth(size: number) {
  return size + (size < s(48) ? s(16) : s(24));
}

// Height of a player for a given avatar size: the circle, the pill over its
// bottom edge and the points under it. Used to fit a column's players.
export function answerPlayerHeight(size: number) {
  return size + (size < s(48) ? s(26) : s(34));
}

function signed(points: number) {
  return points > 0 ? `+${points}` : points < 0 ? `−${Math.abs(points)}` : '0';
}

function pointsStyle(points: number) {
  return points > 0 ? styles.gain : points < 0 ? styles.loss : styles.zero;
}

const styles = StyleSheet.create({
  player: {
    alignItems: 'center',
  },
  seat: {
    backgroundColor: colors.seat,
    borderWidth: s(4),
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thinSeat: {
    borderWidth: s(3),
  },
  correctSeat: {
    borderColor: colors.success,
  },
  // Overlaps the bottom of the circle, slightly tilted, as in the lobby.
  pill: {
    marginTop: -s(9),
    maxWidth: '100%',
    paddingHorizontal: s(8),
    borderRadius: s(12),
    backgroundColor: colors.text,
    transform: [{ rotate: '-3deg' }],
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: s(14),
    lineHeight: s(19),
    color: colors.onBright,
  },
  smallName: {
    fontSize: s(12),
    lineHeight: s(16),
  },
  points: {
    fontFamily: fonts.display,
    fontSize: s(18),
    lineHeight: s(22),
  },
  smallPoints: {
    fontSize: s(14),
    lineHeight: s(17),
  },
  gain: {
    color: colors.success,
  },
  loss: {
    color: colors.danger,
  },
  zero: {
    color: colors.textMuted,
  },
});
