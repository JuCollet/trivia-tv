import { useState } from 'react';
import { Modal, StyleSheet, TVFocusGuideView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';
import FocusableButton from './FocusableButton';
import NewGamePanel, { LANGUAGES, languageLabel } from './NewGamePanel';
import OptionPicker from './OptionPicker';
import type { GameSettings } from '@/game/types';
import { colors, radius, s, spacing } from '@/theme';

// react-native-web has no focus guide: a plain View keeps the web build usable.
const FocusGuide = TVFocusGuideView ?? View;
const QUESTIONS_PER_THEME = [2, 3, 4, 5] as const;
const ROUNDS = [1, 2, 3] as const;
const TIMERS = [10, 15, 20, 30] as const;

export { languageLabel };

type Props = {
  visible: boolean;
  settings: GameSettings;
  // Players' themes are in the game's language: it cannot change once they joined.
  languageLocked: boolean;
  onChange: (settings: GameSettings) => void;
  onClose: () => void;
  // Starts over with these settings: connected phones follow the new game.
  onNewGame: (settings: GameSettings) => void;
};

// Game settings over the lobby, editable with the remote until the game starts,
// even after players entered their themes. The lobby chips update behind the
// dialog, and the server gets the new settings when it closes.
export default function SettingsDialog({ visible, settings, languageLocked, onChange, onClose, onNewGame }: Props) {
  const { t } = useTranslation();
  const [done, setDone] = useState<View | null>(null);
  const [confirmingNewGame, setConfirmingNewGame] = useState(false);
  const update = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) =>
    onChange({ ...settings, [key]: value });
  const close = () => {
    setConfirmingNewGame(false);
    onClose();
  };

  return (
    // The remote's back button closes the dialog.
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={confirmingNewGame ? () => setConfirmingNewGame(false) : close}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          {confirmingNewGame ? (
            <NewGamePanel
              language={settings.language}
              cancelLabel={t('common.cancel')}
              onCancel={() => setConfirmingNewGame(false)}
              onConfirm={(language) => {
                setConfirmingNewGame(false);
                onNewGame({ ...settings, language });
              }}
            />
          ) : (
            <>
              <AppText variant="display">{t('settings.title')}</AppText>
              <View>
                <OptionPicker
                  label={t('settings.language')}
                  options={LANGUAGES}
                  value={settings.language}
                  onChange={(v) => update('language', v)}
                  format={languageLabel}
                  disabled={languageLocked}
                  hasTVPreferredFocus
                />
                <OptionPicker
                  label={t('settings.questionsPerTheme')}
                  options={QUESTIONS_PER_THEME}
                  value={settings.questionsPerTheme}
                  onChange={(v) => update('questionsPerTheme', v)}
                />
                <OptionPicker
                  label={t('settings.rounds')}
                  options={ROUNDS}
                  value={settings.rounds}
                  onChange={(v) => update('rounds', v)}
                />
                <OptionPicker
                  label={t('settings.timer')}
                  options={TIMERS}
                  value={settings.timerSeconds}
                  onChange={(v) => update('timerSeconds', v)}
                  format={(v) => t('common.seconds', { count: v })}
                />
              </View>
              {languageLocked ? (
                <AppText style={styles.hint}>{t('settings.languageLocked')}</AppText>
              ) : null}

              {/* The buttons are right-aligned under the options so tvOS can move up
                  from them, and this full-width guide sends focus down to Done from
                  any option. */}
              <FocusGuide autoFocus destinations={done ? [done] : []} style={styles.actions}>
                <FocusableButton
                  label={t('common.newGame')}
                  icon="refresh"
                  variant="outline"
                  onPress={() => setConfirmingNewGame(true)}
                />
                <FocusableButton ref={setDone} label={t('common.done')} onPress={close} />
              </FocusGuide>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3, 6, 40, 0.75)',
  },
  dialog: {
    width: s(640),
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: s(1.5),
    borderColor: colors.panelBorder,
    backgroundColor: colors.background,
  },
  hint: {
    fontSize: s(14),
    color: colors.highlight,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
});
