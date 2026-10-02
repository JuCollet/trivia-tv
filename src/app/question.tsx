import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import AnswerTile from '@/components/AnswerTile';
import { useRound } from '@/api/rounds';
import AppText from '@/components/AppText';
import Countdown from '@/components/Countdown';
import FocusableButton from '@/components/FocusableButton';
import LoadingScreen from '@/components/LoadingScreen';
import Screen from '@/components/Screen';
import { MOCK_PLAYERS, MOCK_ROOM_CODE, MOCK_ROUND_INDEX } from '@/game/mock';
import { DEFAULT_SETTINGS } from '@/game/rules';
import { spacing } from '@/theme';

// TV screen 4: question, 4 colored choices, timer and number of answers received.
export default function TvQuestion() {
  const { data: round, error, refetch } = useRound(MOCK_ROOM_CODE, MOCK_ROUND_INDEX);
  const answeredCount = 2;
  const showResults = useCallback(() => router.replace('/results'), []);
  if (!round) return <LoadingScreen error={error} onRetry={refetch} />;

  const question = round.questions[0];

  return (
    <Screen>
      <View style={styles.header}>
        <AppText muted>
          {round.theme} · Question 1/{round.questions.length}
        </AppText>
        <Countdown seconds={DEFAULT_SETTINGS.timerSeconds} onEnd={showResults} />
        <AppText muted>
          {answeredCount}/{MOCK_PLAYERS.length} ont répondu
        </AppText>
      </View>

      <AppText variant="display" style={styles.question}>
        {question.question}
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

      {/* The host can stop the timer once everyone has answered. */}
      <FocusableButton label="Révéler" variant="secondary" onPress={showResults} style={styles.skip} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  skip: {
    alignSelf: 'flex-end',
  },
});
