import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import AvatarMedia from './AvatarMedia';
import Pop, { POP_STAGGER_MS } from './Pop';
import { avatarSource } from '@/game/avatars';
import { colors, fonts, s, safeArea } from '@/theme';

export type StandingsPlayer = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  // Points won (or lost) over the round, when known.
  gain: number | null;
};

type Props = {
  title: string;
  subtitle: string;
  players: StandingsPlayer[];
};

// Up to this many players, a single column; beyond, two columns side by side.
const SINGLE_COLUMN_MAX = 6;

// Title, subtitle, then the rows from first to last.
const TITLE_DELAY = 0;
const SUBTITLE_DELAY = POP_STAGGER_MS;
const FIRST_ROW_DELAY = 2 * POP_STAGGER_MS;

// When the last row has popped: the screen's next button comes after it.
export function standingsDuration(count: number) {
  return FIRST_ROW_DELAY + count * POP_STAGGER_MS;
}

// The ranking at the end of a round: the title and subtitle laid out like an
// award's, then one row per player with their rank, avatar, name, what the
// round brought them and their score. Players with the same score share a rank.
export default function Standings({ title, subtitle, players }: Props) {
  const ranked = [...players].sort((a, b) => b.score - a.score);
  const ranks = ranked.map((player) => ranked.findIndex((other) => other.score === player.score) + 1);
  const twoColumns = ranked.length > SINGLE_COLUMN_MAX;
  const half = Math.ceil(ranked.length / 2);
  const columns = twoColumns ? [ranked.slice(0, half), ranked.slice(half)] : [ranked];

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pop delay={TITLE_DELAY}>
          <AppText variant="display" style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
        </Pop>
        <Pop delay={SUBTITLE_DELAY}>
          <AppText style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </AppText>
        </Pop>
      </View>
      <View style={styles.columns}>
        {columns.map((column, c) => (
          <View key={c} style={[styles.column, twoColumns ? styles.halfColumn : styles.singleColumn]}>
            {column.map((player, i) => {
              const order = c * half + i;
              return (
                <Pop key={player.id} delay={FIRST_ROW_DELAY + order * POP_STAGGER_MS}>
                  <Row player={player} rank={ranks[order]} />
                </Pop>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

function Row({ player, rank }: { player: StandingsPlayer; rank: number }) {
  const still = avatarSource(player.avatar);
  const leader = rank === 1;
  return (
    <View style={[styles.row, leader && styles.leaderRow]}>
      <AppText variant="title" style={[styles.rank, leader && styles.leaderRank]}>
        {rank}
      </AppText>
      <View style={styles.seat}>{still ? <AvatarMedia still={still} size="84%" /> : null}</View>
      <AppText variant="title" style={styles.name} numberOfLines={1}>
        {player.name}
      </AppText>
      {player.gain !== null ? (
        <AppText style={[styles.gain, gainStyle(player.gain)]}>{signed(player.gain)}</AppText>
      ) : null}
      <AppText variant="title" style={styles.score}>
        {player.score}
      </AppText>
    </View>
  );
}

function signed(points: number) {
  return points > 0 ? `+${points}` : points < 0 ? `−${Math.abs(points)}` : '0';
}

function gainStyle(points: number) {
  return points > 0 ? styles.positive : points < 0 ? styles.negative : styles.zero;
}

const SEAT_SIZE = s(42);
const ROW_HEIGHT = s(54);
const ROW_GAP = s(8);

const styles = StyleSheet.create({
  page: {
    position: 'absolute',
    top: safeArea.vertical,
    left: safeArea.horizontal,
    right: safeArea.horizontal,
    bottom: safeArea.vertical,
    alignItems: 'center',
    gap: s(16),
  },
  header: {
    alignItems: 'center',
    gap: s(6),
  },
  // Same sizes as an award's title and subtitle.
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
  columns: {
    flexDirection: 'row',
    gap: s(16),
  },
  column: {
    gap: ROW_GAP,
  },
  singleColumn: {
    width: s(560),
  },
  halfColumn: {
    width: s(400),
  },
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(14),
    paddingLeft: s(14),
    paddingRight: s(20),
    borderRadius: s(12),
    backgroundColor: colors.surface,
  },
  leaderRow: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: s(3),
    borderColor: colors.accent,
    paddingLeft: s(11),
    paddingRight: s(17),
  },
  rank: {
    width: s(22),
    textAlign: 'center',
    color: colors.textMuted,
  },
  leaderRank: {
    color: colors.accent,
  },
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: SEAT_SIZE / 2,
    borderWidth: s(3),
    borderColor: colors.text,
    backgroundColor: colors.seat,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  name: {
    flex: 1,
    fontSize: s(22),
  },
  gain: {
    fontFamily: fonts.bodyBold,
    fontSize: s(16),
  },
  score: {
    minWidth: s(64),
    textAlign: 'right',
    fontSize: s(24),
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.danger,
  },
  zero: {
    color: colors.textMuted,
  },
});
