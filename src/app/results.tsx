import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TvView } from '@jucollet/trivia-client/schema';
import AnswerPlayer, { answerPlayerHeight, answerPlayerWidth } from '@/components/AnswerPlayer';
import AnswerTile from '@/components/AnswerTile';
import AppText from '@/components/AppText';
import AvatarMedia from '@/components/AvatarMedia';
import FocusableButton, { ROUND_RING } from '@/components/FocusableButton';
import LoadingScreen from '@/components/LoadingScreen';
import Pop, { POP_STAGGER_MS } from '@/components/Pop';
import Screen from '@/components/Screen';
import { avatarSource } from '@/game/avatars';
import { useGame } from '@/game/GameProvider';
import { useScreenSfx } from '@/hooks/useScreenSfx';
import { colors, fonts, radius, s, spacing } from '@/theme';

type ScoreLine = NonNullable<TvView['result']>['scores'][number];
type Player = TvView['players'][number];

// The players pop in one after the other, from the fastest answer to the
// slowest, once the screen has faded in; those who did not answer come last,
// then the next button.
const FIRST_POP_MS = 2 * POP_STAGGER_MS;

// TV screen 5: the question in the header, its 4 answers in columns with the
// players who picked each one under it (the right one lit, the others dimmed),
// what each player won or lost, then the explanation and who did not answer.
// The ranking waits for the end of the round (awards screen).
export default function TvResults() {
  const { t } = useTranslation();
  const { view, next } = useGame();
  const { question, result, round } = view ?? {};
  useScreenSfx(result ? 'correct' : null);
  if (!view || !question || !result || !round) return <LoadingScreen />;

  const players = new Map(view.players.map((player) => [player.id, player]));
  // Fastest first: the order of the columns' players and of the pops.
  const answered = result.scores
    .filter((line) => line.choice !== null)
    .sort((a, b) => (a.responseMillis ?? 0) - (b.responseMillis ?? 0));
  const silent = result.scores.filter((line) => line.choice === null);
  const delayOf = new Map(answered.map((line, order) => [line.playerId, FIRST_POP_MS + order * POP_STAGGER_MS]));
  const silentDelay = FIRST_POP_MS + answered.length * POP_STAGGER_MS;
  const nextDelay = silentDelay + (silent.length > 0 ? POP_STAGGER_MS : 0);

  const nextLabel = round.isFinal
    ? t('results.podium')
    : question.number === question.total
      ? t('results.roundEnd')
      : t('results.nextQuestion');

  return (
    <Screen>
      <View style={styles.header}>
        <AppText muted numberOfLines={1}>
          {round.isFinal ? t('question.finalMystery') : round.theme} ·{' '}
          {round.isFinal
            ? t('question.multiplier', { multiplier: question.multiplier })
            : t('question.progress', { number: question.number, total: question.total })}
        </AppText>
        <AppText variant="title" style={styles.question} numberOfLines={2}>
          {question.text}
        </AppText>
      </View>

      <View style={styles.columns}>
        {question.choices.map((choice, index) => (
          <AnswerColumn
            key={index}
            index={index}
            label={choice}
            correct={index === result.answerIndex}
            lines={answered.filter((line) => line.choice === index)}
            players={players}
            delayOf={delayOf}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <AppText style={styles.explanation} numberOfLines={2}>
          {result.explanation}
        </AppText>
        {silent.length > 0 ? (
          <Pop delay={silentDelay} style={styles.silent}>
            <View style={styles.silentAvatars}>
              {silent.map((line) => (
                <SilentAvatar key={line.playerId} player={players.get(line.playerId)} />
              ))}
            </View>
            <AppText muted style={styles.silentText} numberOfLines={2}>
              {t('results.noAnswer', {
                count: silent.length,
                names: silent.map((line) => players.get(line.playerId)?.name ?? '?').join(', '),
              })}
            </AppText>
          </Pop>
        ) : null}
      </View>

      <Pop delay={nextDelay} style={styles.next}>
        <FocusableButton variant="round" icon="arrow-forward" label={nextLabel} onPress={next} hasTVPreferredFocus />
      </Pop>
    </Screen>
  );
}

type ColumnProps = {
  index: number;
  label: string;
  correct: boolean;
  lines: ScoreLine[];
  players: Map<string, Player>;
  delayOf: Map<string, number>;
};

// One answer: its tile, ringed in white when it is the right one and dimmed
// otherwise, and the players who picked it, as big as the column allows.
function AnswerColumn({ index, label, correct, lines, players, delayOf }: ColumnProps) {
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (box?.width !== width || box?.height !== height) setBox({ width, height });
  };
  // Drawn once the column's size is known, so each player pops at its final size.
  const size = box ? fitAvatarSize(lines.length, box.width, box.height) : null;

  return (
    <View style={styles.column}>
      <View style={styles.tile}>
        {correct ? <View style={styles.ring} /> : null}
        <AnswerTile index={index} label={label} dimmed={!correct} />
      </View>
      <View style={[styles.stack, correct && styles.rightStack]} onLayout={onLayout}>
        {size !== null
          ? lines.map((line) => {
              const player = players.get(line.playerId);
              return (
                <Pop key={line.playerId} delay={delayOf.get(line.playerId) ?? 0}>
                  <AnswerPlayer
                    name={player?.name ?? '?'}
                    avatar={player?.avatar}
                    points={line.points}
                    correct={line.correct}
                    size={size}
                  />
                </Pop>
              );
            })
          : null}
      </View>
    </View>
  );
}

function SilentAvatar({ player }: { player?: Player }) {
  const still = player ? avatarSource(player.avatar) : undefined;
  return (
    <View style={styles.silentSeat}>
      {still ? <AvatarMedia still={still} size="84%" /> : null}
    </View>
  );
}

const STACK_BORDER = s(1.5);
const STACK_PADDING_X = s(6);
const STACK_PADDING_Y = s(10);
const PLAYER_GAP_X = s(6);
const PLAYER_GAP_Y = s(4);
const AVATAR_SIZES = [60, 56, 52, 48, 44, 40, 36, 32, 28, 24].map(s);

// The biggest avatar that lets all of a column's players fit in it.
function fitAvatarSize(count: number, width: number, height: number) {
  for (const size of AVATAR_SIZES) {
    // The stack's border is inside the measured box.
    const perRow = Math.max(
      1,
      Math.floor((width - 2 * (STACK_PADDING_X + STACK_BORDER) + PLAYER_GAP_X) / (answerPlayerWidth(size) + PLAYER_GAP_X)),
    );
    const rows = Math.ceil(count / perRow);
    const needed = rows * answerPlayerHeight(size) + Math.max(0, rows - 1) * PLAYER_GAP_Y + 2 * (STACK_PADDING_Y + STACK_BORDER);
    if (needed <= height) return size;
  }
  return AVATAR_SIZES[AVATAR_SIZES.length - 1];
}

const TILE_HEIGHT = s(64);
const RING = s(4);
const SILENT_SIZE = s(34);
// The round button: a 64 disc, 48 from the right and 30 from the bottom of
// the screen, as on the awards screen.
const NEXT_SIZE = s(64);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  question: {
    flex: 1,
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
    gap: spacing.sm,
  },
  tile: {
    height: TILE_HEIGHT,
  },
  // Around the right answer, outside the tile so all tiles keep the same size.
  ring: {
    position: 'absolute',
    top: -RING,
    bottom: -RING,
    left: -RING,
    right: -RING,
    borderRadius: radius.md + RING,
    borderWidth: RING,
    borderColor: colors.text,
  },
  stack: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'flex-start',
    columnGap: PLAYER_GAP_X,
    rowGap: PLAYER_GAP_Y,
    paddingHorizontal: STACK_PADDING_X,
    paddingVertical: STACK_PADDING_Y,
    borderRadius: radius.md,
    borderWidth: STACK_BORDER,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  rightStack: {
    borderColor: colors.success,
    backgroundColor: colors.rightAnswer,
  },
  // Same height as the next button, which sits at its right end.
  footer: {
    height: NEXT_SIZE,
    marginTop: spacing.sm,
    marginRight: NEXT_SIZE + spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  explanation: {
    flex: 1,
  },
  silent: {
    maxWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  silentAvatars: {
    flexDirection: 'row',
  },
  silentSeat: {
    width: SILENT_SIZE,
    height: SILENT_SIZE,
    borderRadius: SILENT_SIZE / 2,
    marginRight: -s(8),
    borderWidth: s(2.5),
    borderColor: colors.text,
    backgroundColor: colors.seat,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    opacity: 0.5,
  },
  silentText: {
    flexShrink: 1,
    marginLeft: s(8),
    fontFamily: fonts.bodyMedium,
  },
  next: {
    position: 'absolute',
    right: s(48) - ROUND_RING,
    bottom: s(30) - ROUND_RING,
  },
});
