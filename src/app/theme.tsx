import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useRound } from '@/api/rounds';
import AppText from '@/components/AppText';
import FocusableButton from '@/components/FocusableButton';
import LoadingScreen from '@/components/LoadingScreen';
import Screen from '@/components/Screen';
import { MOCK_ROOM_CODE, MOCK_ROUND_INDEX, playerName } from '@/game/mock';
import { colors } from '@/theme';

// TV screen 3: reveals the player's theme, or waits if generation isn't finished.
export default function TvThemeReveal() {
  const { data: round, error, refetch } = useRound(MOCK_ROOM_CODE, MOCK_ROUND_INDEX);
  if (!round) return <LoadingScreen error={error} onRetry={refetch} />;

  const isGenerating = round.questions.length === 0;

  return (
    <Screen centered>
      <AppText variant="title" muted>
        Le thème de {playerName(round.masterId)}
      </AppText>

      {isGenerating ? (
        <>
          <ActivityIndicator size="large" color={colors.accent} />
          <AppText muted>Claude prépare les questions…</AppText>
        </>
      ) : (
        <>
          <AppText variant="hero">{round.theme}</AppText>
          <FocusableButton label="C'est parti" onPress={() => router.replace('/question')} hasTVPreferredFocus />
        </>
      )}
    </Screen>
  );
}
