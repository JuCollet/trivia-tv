import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import AppText from '@/components/AppText';
import FocusableButton from '@/components/FocusableButton';
import PlayerList from '@/components/PlayerList';
import QrPlaceholder from '@/components/QrPlaceholder';
import Screen from '@/components/Screen';
import { MOCK_PLAYERS, MOCK_ROOM_CODE } from '@/game/mock';
import { MAX_PLAYERS, MIN_PLAYERS } from '@/game/rules';
import { spacing } from '@/theme';

// TV screen 2: lobby with QR code, room code and arriving players.
export default function TvLobby() {
  const players = MOCK_PLAYERS;
  const canStart = players.length >= MIN_PLAYERS && players.some((p) => p.themesReady);

  return (
    <Screen style={styles.layout}>
      <View style={styles.join}>
        <QrPlaceholder value={MOCK_ROOM_CODE} />
        <AppText muted>Ou rejoins avec le code</AppText>
        <AppText variant="hero">{MOCK_ROOM_CODE}</AppText>
      </View>

      <View style={styles.players}>
        <AppText variant="title">
          Joueurs {players.length}/{MAX_PLAYERS}
        </AppText>
        <PlayerList players={players} showThemeStatus />
        <FocusableButton
          label="Lancer la partie"
          onPress={() => router.replace('/theme')}
          disabled={!canStart}
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
  join: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  players: {
    flex: 1,
    gap: spacing.md,
  },
});
