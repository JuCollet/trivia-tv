import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import AiDisclaimer from '@/components/AiDisclaimer';
import AppText from '@/components/AppText';
import FinalReveal from '@/components/FinalReveal';
import FocusableButton from '@/components/FocusableButton';
import LoadingScreen from '@/components/LoadingScreen';
import Screen from '@/components/Screen';
import { useScreenSfx } from '@/hooks/useScreenSfx';
import { useGame } from '@/game/GameProvider';
import { colors } from '@/theme';

// TV screen 3: reveals the player's theme, or waits if generation isn't finished.
// Also announces the mystery final question, with a slot machine.
export default function TvThemeReveal() {
  const { t } = useTranslation();
  const { view, next, settings, playedThemes } = useGame();
  const round = view?.round;
  // The game opens with a word on the AI-written questions, before the first theme.
  const [disclaimerDone, setDisclaimerDone] = useState(false);
  const showDisclaimer = round?.number === 1 && !disclaimerDone;
  // The theme is revealed once its questions are generated. The final question's slot machine plays its own sounds.
  useScreenSfx(round?.ready && !round.isFinal && !showDisclaimer ? 'theme-reveal' : null);
  if (!round) return <LoadingScreen />;
  if (round.isFinal) {
    return (
      <FinalReveal
        theme={round.ready ? round.theme : null}
        playedThemes={playedThemes}
        language={settings.language}
        onGo={next}
      />
    );
  }
  if (showDisclaimer) return <AiDisclaimer onDone={() => setDisclaimerDone(true)} />;

  return (
    <Screen centered>
      <AppText variant="title" muted>
        {t('theme.header', { number: round.number, total: round.total, master: round.masterName ?? '?' })}
      </AppText>

      {round.ready ? (
        <>
          <AppText variant="hero">{round.theme}</AppText>
          {round.themeReplaced ? <AppText muted>{t('theme.replaced')}</AppText> : null}
          <FocusableButton label={t('theme.go')} onPress={next} sound="start" hasTVPreferredFocus />
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.accent} />
          <AppText muted>{t('theme.preparing')}</AppText>
        </>
      )}
    </Screen>
  );
}
