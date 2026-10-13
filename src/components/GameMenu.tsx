import { useEffect, useRef, useState } from 'react';
import { BackHandler, Modal, Platform, StyleSheet, TVEventControl, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import NewGamePanel from './NewGamePanel';
import { useGame } from '@/game/GameProvider';
import { colors, radius, s, spacing } from '@/theme';

// During a game, the remote's Menu (back) button opens this dialog to start
// over, e.g. when a player leaves. In the lobby, the button keeps its default
// behavior (leaving the app) and the settings dialog offers the same action.
export default function GameMenu() {
  const { t } = useTranslation();
  const { view, settings, newGame } = useGame();
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  const playing = view !== null && view.phase !== 'LOBBY';

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!playing) return;
    // tvOS hands the Menu button to the app only once asked to.
    if (Platform.OS === 'ios') TVEventControl.enableTVMenuKey();
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      // While the dialog is open, the Modal handles the button itself.
      if (!openRef.current) setOpen(true);
      return true;
    });
    return () => {
      subscription.remove();
      if (Platform.OS === 'ios') TVEventControl.disableTVMenuKey();
    };
  }, [playing]);

  return (
    <Modal visible={playing && open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <NewGamePanel
            language={settings.language}
            cancelLabel={t('newGame.resume')}
            onCancel={() => setOpen(false)}
            onConfirm={(language) => {
              setOpen(false);
              newGame({ ...settings, language });
            }}
          />
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
});
