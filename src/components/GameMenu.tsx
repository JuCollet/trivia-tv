import { useEffect, useRef, useState } from 'react';
import { BackHandler, Modal, Platform, Pressable, StyleSheet, TVEventControl, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import NewGamePanel from './NewGamePanel';
import { useGame } from '@/game/GameProvider';
import { useRemoteEvents } from '@/hooks/useRemoteEvents';
import { colors, radius, s, spacing } from '@/theme';

// During a game, the remote's Menu (back) button opens this dialog to start
// over, e.g. when a player leaves. In the lobby, the button keeps its default
// behavior (leaving the app) and the settings dialog offers the same action.
// In a browser, Escape or a Menu button in the corner stand in for that button.
export default function GameMenu() {
  const { t } = useTranslation();
  const { view, settings, newGame } = useGame();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
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

  useRemoteEvents((event) => {
    if (Platform.OS === 'web' && playing && event.eventType === 'back' && !openRef.current) setOpen(true);
  });

  return (
    <>
      {Platform.OS === 'web' && playing && !open && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('web.menu')}
          onPress={() => setOpen(true)}
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          style={[styles.webMenuButton, hovered && styles.webMenuButtonHovered]}
        >
          <Ionicons name="menu" size={s(18)} color={colors.text} />
        </Pressable>
      )}
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
    </>
  );
}

const styles = StyleSheet.create({
  // Small and in the corner, clear of every screen's content (inside the safe area).
  webMenuButton: {
    position: 'absolute',
    top: s(6),
    right: s(6),
    padding: s(5),
    borderRadius: radius.sm,
    opacity: 0.5,
  },
  webMenuButtonHovered: {
    opacity: 1,
    backgroundColor: colors.surface,
  },
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
    backgroundColor: colors.background,
  },
});
