import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AnswerTile from '@/components/AnswerTile';
import AppText from '@/components/AppText';
import FocusableButton from '@/components/FocusableButton';
import LoadingScreen from '@/components/LoadingScreen';
import PlayerList from '@/components/PlayerList';
import PointsBreakdown from '@/components/PointsBreakdown';
import Screen from '@/components/Screen';
import { useScreenSfx } from '@/hooks/useScreenSfx';
import { breakdown } from '@/game/breakdown';
import { playerName, useGame } from '@/game/GameProvider';
import { s, spacing } from '@/theme';

// TV screen 5: correct answer, explanation, where each player's points come
// from, and ranking after each question.
export default function TvResults() {
  const { t } = useTranslation();
  const { view, next } = useGame();
  const { question, result, round } = view ?? {};
  useScreenSfx(result ? 'correct' : null);
  if (!view || !question || !result || !round) return <LoadingScreen />;

  const ranking = [...view.players].sort((a, b) => b.score - a.score);
  const lines = breakdown(result.scores, round.masterId);
  const gains = Object.fromEntries(result.scores.map((line) => [line.playerId, line.points]));
  const nextLabel = round.isFinal
    ? t('results.podium')
    : question.number === question.total
      ? t('results.roundEnd')
      : t('results.nextQuestion');

  return (
    <Screen style={styles.layout}>
      <View style={styles.column}>
        <AppText muted>{t('results.correctAnswer')}</AppText>
        <View style={styles.answer}>
          <AnswerTile index={result.answerIndex} label={question.choices[result.answerIndex]} />
        </View>
        <AppText>{result.explanation}</AppText>
        <View style={styles.breakdown}>
          <AppText muted>{t('results.breakdown.title')}</AppText>
          <PointsBreakdown lines={lines} nameOf={(playerId) => playerName(view, playerId)} />
        </View>
      </View>

      <View style={styles.column}>
        <AppText variant="title">{t('results.ranking')}</AppText>
        <PlayerList players={ranking} showScores gains={gains} />
        <FocusableButton label={nextLabel} onPress={next} hasTVPreferredFocus />
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
  breakdown: {
    gap: spacing.xs,
  },
});
