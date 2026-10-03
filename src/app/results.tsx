import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import AnswerTile from '@/components/AnswerTile';
import { useRound } from '@/api/rounds';
import AppText from '@/components/AppText';
import FocusableButton from '@/components/FocusableButton';
import LoadingScreen from '@/components/LoadingScreen';
import PlayerList from '@/components/PlayerList';
import Screen from '@/components/Screen';
import { useScreenSfx } from '@/hooks/useScreenSfx';
import { MOCK_PLAYERS, MOCK_ROOM_CODE, MOCK_ROUND_INDEX } from '@/game/mock';
import { s, spacing } from '@/theme';

// TV screen 5: correct answer, explanation and ranking after each question.
export default function TvResults() {
  const { data: round, error, refetch } = useRound(MOCK_ROOM_CODE, MOCK_ROUND_INDEX);
  useScreenSfx(round ? 'correct' : null);
  if (!round) return <LoadingScreen error={error} onRetry={refetch} />;

  const questionIndex = 0;
  const question = round.questions[questionIndex];
  const ranking = [...MOCK_PLAYERS].sort((a, b) => b.score - a.score);
  const isLastOfRound = questionIndex === round.questions.length - 1;

  return (
    <Screen style={styles.layout}>
      <View style={styles.column}>
        <AppText muted>Bonne réponse</AppText>
        <View style={styles.answer}>
          <AnswerTile index={question.answerIndex} label={question.choices[question.answerIndex]} />
        </View>
        <AppText>{question.explanation}</AppText>
      </View>

      <View style={styles.column}>
        <AppText variant="title">Classement</AppText>
        <PlayerList players={ranking} showScores />
        <FocusableButton
          label={isLastOfRound ? 'Fin de manche' : 'Question suivante'}
          onPress={() => router.replace(isLastOfRound ? '/awards' : '/question')}
          hasTVPreferredFocus
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  column: {
    flex: 1,
    gap: spacing.md,
  },
  answer: {
    height: s(64),
  },
});
