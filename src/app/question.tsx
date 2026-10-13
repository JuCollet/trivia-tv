import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AnswerTile from '@/components/AnswerTile';
import AppText from '@/components/AppText';
import Countdown from '@/components/Countdown';
import LoadingScreen from '@/components/LoadingScreen';
import Screen from '@/components/Screen';
import { useGame } from '@/game/GameProvider';
import { spacing } from '@/theme';

// TV screen 4: question, 4 colored choices, timer and number of answers received.
// The server closes the question when the timer ends or everyone has answered.
export default function TvQuestion() {
  const { t } = useTranslation();
  const { view } = useGame();
  const question = view?.question;
  const round = view?.round;
  if (!view || !question || !round) return <LoadingScreen />;

  const playerCount = view.players.filter((p) => p.connected).length;

  return (
    <Screen>
      <View style={styles.header}>
        <AppText muted>
          {round.isFinal ? t('question.finalMystery') : round.theme} ·{' '}
          {round.isFinal
            ? t('question.multiplier', { multiplier: question.multiplier })
            : t('question.progress', { number: question.number, total: question.total })}
        </AppText>
        <Countdown key={question.sequence} endsAt={question.endsAt} />
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

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <AnswerTile index={0} label={question.choices[0]} />
          <AnswerTile index={1} label={question.choices[1]} />
        </View>
        <View style={styles.gridRow}>
          <AnswerTile index={2} label={question.choices[2]} />
          <AnswerTile index={3} label={question.choices[3]} />
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
