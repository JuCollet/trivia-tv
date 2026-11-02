import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MUSIC } from '@/audio/sounds';
import AnswerTile from '@/components/AnswerTile';
import AppText from '@/components/AppText';
import Countdown from '@/components/Countdown';
import LoadingScreen from '@/components/LoadingScreen';
import Screen from '@/components/Screen';
import { useGame } from '@/game/GameProvider';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { s, spacing } from '@/theme';

// TV screen 4: question, 4 colored choices, timer and number of answers received.
// The server first sends the question alone, without its choices, so that everyone reads it. When the reading time
// is over, it sends the choices and the timer starts. It closes the question when the timer ends or everyone has
// answered.
export default function TvQuestion() {
  const { t } = useTranslation();
  const { view } = useGame();
  // Loops during reading and answering, stops when the results screen takes over.
  // Kept low so the clicks and the tick-tock stay audible over it.
  useBackgroundMusic(MUSIC.question, 0.25);
  const question = view?.question;
  const round = view?.round;
  if (!view || !question || !round) return <LoadingScreen />;

  const playerCount = view.players.filter((p) => p.connected).length;
  // No choice during the reading time (`answersOpen` is false on the server)
  const reading = question.choices.length === 0;

  return (
    <Screen>
      <View style={styles.header}>
        <AppText muted>
          {round.isFinal ? t('question.finalMystery') : round.theme} ·{' '}
          {round.isFinal
            ? t('question.multiplier', { multiplier: question.multiplier })
            : t('question.progress', { number: question.number, total: question.total })}
        </AppText>
        {reading ? (
          <View style={styles.countdownPlaceholder} />
        ) : (
          <Countdown key={question.sequence} endsAt={question.endsAt} maxSeconds={question.timerSeconds} />
        )}
        <AppText muted>
          {t('question.answered', { count: question.answeredCount, total: playerCount })}
        </AppText>
      </View>

      {round.isFinal && round.theme ? (
        <AppText variant="title" style={styles.theme}>
          {t('question.finalTheme', { theme: round.theme })}
        </AppText>
      ) : null}

      <AppText variant="display" style={styles.question}>
        {question.text}
      </AppText>

      {reading ? (
        <AppText muted style={styles.reading}>
          {t('question.reading')}
        </AppText>
      ) : null}

      {/* Empty tiles while reading, so that nothing moves when the choices appear */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <AnswerTile index={0} label={question.choices[0] ?? ''} dimmed={reading} />
          <AnswerTile index={1} label={question.choices[1] ?? ''} dimmed={reading} />
        </View>
        <View style={styles.gridRow}>
          <AnswerTile index={2} label={question.choices[2] ?? ''} dimmed={reading} />
          <AnswerTile index={3} label={question.choices[3] ?? ''} dimmed={reading} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  theme: {
    textAlign: 'center',
    marginTop: spacing.md,
  },
  question: {
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  reading: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  // Same size as the countdown circle, to keep the header in place when the timer appears
  countdownPlaceholder: {
    width: s(72),
    height: s(72),
  },
  grid: {
    flex: 1,
    gap: spacing.md,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
});
