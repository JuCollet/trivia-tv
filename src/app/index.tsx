import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { MUSIC } from '@/audio/sounds';
import AppText from '@/components/AppText';
import FocusableButton from '@/components/FocusableButton';
import PlayerSlot, { type LobbyPlayer } from '@/components/PlayerSlot';
import QrCode from '@/components/QrCode';
import Screen from '@/components/Screen';
import RulesCarousel from '@/components/RulesCarousel';
import SettingsDialog, { languageLabel } from '@/components/SettingsDialog';
import { JOIN_URL, joinLink } from '@/api/client';
import LoadingScreen from '@/components/LoadingScreen';
import { useGame } from '@/game/GameProvider';
import { estimateGameMinutes, MAX_PLAYERS, MIN_PLAYERS } from '@/game/rules';
import type { GameSettings } from '@/game/types';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { setLanguage } from '@/i18n';
import { colors, fonts, radius, s, safeArea, spacing } from '@/theme';

const BACKGROUND = require('../../assets/images/backgrounds/neutral.jpg');
const SLOTS_PER_ROW = MAX_PLAYERS / 2;
const SEAT_SIZE = s(92);
// Shown without the scheme, for players who type the address and the code.
const JOIN_HOST = JOIN_URL.replace(/^https?:\/\//, '');

type DayPart = 'morning' | 'afternoon' | 'evening';

// "Who's playing tonight?" follows the TV's clock: morning before noon,
// afternoon until 6 pm, evening after.
function dayPart(date: Date): DayPart {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

function useDayPart(): DayPart {
  const [part, setPart] = useState(() => dayPart(new Date()));
  useEffect(() => {
    const timer = setInterval(() => setPart(dayPart(new Date())), 60_000);
    return () => clearInterval(timer);
  }, []);
  return part;
}

// TV screen 1: the room is created as soon as the app opens. Players join with
// the QR code or the room code and enter their themes in secret on their phone;
// the host tweaks the settings and starts the game with the remote.
// Left: who is playing. Right: how to join, the settings and the rules.
export default function TvLobby() {
  useBackgroundMusic(MUSIC.lobby, 0.4);
  const { t } = useTranslation();
  const game = useGame();
  const part = useDayPart();
  const [draft, setDraft] = useState<GameSettings>(game.settings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  // The settings summary follows the dialog while it is open.
  const settings = settingsOpen ? draft : game.settings;
  // Picking a language in the settings switches the interface right away.
  useEffect(() => setLanguage(settings.language), [settings.language]);

  if (!game.view || game.view.phase !== 'LOBBY') {
    return (
      <LoadingScreen
        message={t('lobby.creating')}
        error={game.error ? new Error(game.error) : null}
        onRetry={() => game.newGame(settings)}
      />
    );
  }

  const { code } = game.view;
  const players: LobbyPlayer[] = game.view.players.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    ready: p.themesReady,
    connected: p.connected,
  }));
  const minutes = estimateGameMinutes(settings, players.length);
  // Spec: start stays greyed out until every theme is entered.
  const canStart = game.view.canStart;
  // Settings change live, even after players entered their themes: the server
  // keeps their themes and asks for the missing ones. They are sent when the
  // dialog closes, so that browsing the options does not trigger generations.
  const openSettings = () => {
    setDraft(game.settings);
    setSettingsOpen(true);
  };
  const closeSettings = () => {
    setSettingsOpen(false);
    if (JSON.stringify(draft) !== JSON.stringify(game.settings)) game.changeSettings(draft);
  };
  const startOver = (next: GameSettings) => {
    setSettingsOpen(false);
    game.newGame(next);
  };

  return (
    <Screen background={BACKGROUND} style={styles.screen}>
      <View style={styles.left}>
        <AppText variant="hero" style={styles.title}>
          {t('lobby.titleStart')}
          <Text style={styles.titleHighlight}>{t(`lobby.title_${part}`)}</Text>
        </AppText>

        <PlayerGrid players={players} />

        <Legend players={players} />

        <FocusableButton
          label={t('lobby.launch')}
          icon="play"
          variant="launch"
          onPress={game.start}
          disabled={!canStart}
          sound="start"
          hasTVPreferredFocus={canStart}
          style={styles.launchButton}
          labelStyle={styles.launchLabel}
        />
      </View>

      <View style={styles.sidebar}>
        <View style={styles.join}>
          <AppText variant="display" style={styles.joinTitle}>
            <Text style={styles.joinHighlight}>{t('lobby.joinHighlight')}</Text> {t('lobby.joinRest')}
          </AppText>
          <QrCode value={joinLink(code)} size={s(124)} style={styles.qr} />
          <AppText style={styles.scanText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {t('lobby.orUrl', { host: JOIN_HOST })}
          </AppText>
          <View style={styles.code}>
            <AppText variant="hero" style={styles.codeText}>
              {code}
            </AppText>
          </View>
        </View>

        <View style={styles.infos}>
          <Info icon="timer-outline" accent>
            {minutes === null ? t('lobby.durationUnknown') : t('lobby.duration', { minutes })}
          </Info>
          <Info icon="layers-outline">{t('lobby.rounds', { count: settings.rounds })}</Info>
          <Info icon="help-circle-outline">{t('lobby.questions', { count: settings.questionsPerTheme })}</Info>
          <Info icon="stopwatch-outline">{t('lobby.timer', { count: settings.timerSeconds })}</Info>
          <Info icon="globe-outline">{languageLabel(settings.language)}</Info>
        </View>

        <View style={styles.sideActions}>
          <FocusableButton
            label={t('lobby.rules')}
            icon="book"
            variant="outline"
            onPress={() => setRulesOpen(true)}
            style={styles.sideButton}
            labelStyle={styles.sideLabel}
          />
          <FocusableButton
            label={t('lobby.settings')}
            icon="settings-sharp"
            variant="outline"
            onPress={openSettings}
            hasTVPreferredFocus={!canStart}
            style={styles.sideButton}
            labelStyle={styles.sideLabel}
          />
        </View>
      </View>

      <RulesCarousel visible={rulesOpen} onClose={() => setRulesOpen(false)} />
      <SettingsDialog
        visible={settingsOpen}
        settings={settings}
        languageLocked={players.length > 0}
        onChange={setDraft}
        onClose={closeSettings}
        onNewGame={startOver}
      />
    </Screen>
  );
}

function Info({
  icon,
  accent,
  children,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  accent?: boolean;
  children: ReactNode;
}) {
  const color = accent ? colors.accent : colors.text;
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={s(17)} color={color} />
      <AppText style={[styles.infoText, { color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {children}
      </AppText>
    </View>
  );
}

// Every seat of the room, two rows of round avatars: joined players first,
// then free seats.
function PlayerGrid({ players }: { players: LobbyPlayer[] }) {
  const rows = [0, SLOTS_PER_ROW].map((start) =>
    Array.from({ length: SLOTS_PER_ROW }, (_, i) => start + i),
  );
  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row[0]} style={styles.gridRow}>
          {row.map((seat) => {
            const player = players[seat];
            return player ? (
              <PlayerSlot key={player.id} player={player} size={SEAT_SIZE} />
            ) : (
              // The first free seat invites the next player to scan the code.
              <PlayerSlot key={seat} hint={seat === players.length} size={SEAT_SIZE} />
            );
          })}
        </View>
      ))}
    </View>
  );
}

// Explains the ring colors, only those on screen, and what is still missing to start.
function Legend({ players }: { players: LobbyPlayer[] }) {
  const { t } = useTranslation();
  const missing = MIN_PLAYERS - players.length;
  const anyWaiting = players.some((p) => !p.ready);
  const anyReady = players.some((p) => p.ready);
  return (
    <View style={styles.legend}>
      {anyWaiting ? <LegendItem color={colors.notReady} label={t('lobby.legendWaiting')} /> : null}
      {anyReady ? <LegendItem color={colors.ready} label={t('lobby.legendReady')} /> : null}
      {missing > 0 ? (
        <AppText style={styles.legendText}>{t('lobby.missingPlayers', { count: missing })}</AppText>
      ) : null}
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { borderColor: color }]} />
      <AppText style={styles.legendText}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  // The sidebar runs the full height and to the right edge: the screen only
  // keeps the safe area on the left, and each side pads itself.
  screen: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingRight: 0,
    paddingVertical: 0,
  },
  left: {
    flex: 1,
    paddingVertical: safeArea.vertical,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: s(40),
    lineHeight: s(48),
  },
  titleHighlight: {
    color: colors.highlight,
  },
  grid: {
    gap: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(20),
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: spacing.lg,
    rowGap: spacing.xs,
    minHeight: s(20),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: s(14),
    height: s(14),
    borderRadius: s(7),
    borderWidth: s(3),
    backgroundColor: colors.seat,
  },
  legendText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: s(14),
    color: colors.highlight,
  },
  launchButton: {
    width: s(320),
  },
  launchLabel: {
    fontSize: s(26),
  },
  sidebar: {
    width: s(250),
    gap: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: safeArea.horizontal,
    paddingVertical: safeArea.vertical,
    backgroundColor: colors.sidebar,
  },
  join: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  joinTitle: {
    fontSize: s(22),
    textAlign: 'center',
  },
  joinHighlight: {
    color: colors.accent,
  },
  qr: {
    borderWidth: s(4),
    borderColor: colors.accent,
  },
  scanText: {
    fontFamily: fonts.bodyMedium,
    fontSize: s(12),
    color: colors.highlight,
    textAlign: 'center',
  },
  code: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    borderRadius: s(24),
    borderWidth: s(1.5),
    borderColor: colors.panelBorder,
    backgroundColor: colors.background,
  },
  codeText: {
    fontSize: s(26),
    letterSpacing: s(3),
  },
  infos: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: s(15),
  },
  sideActions: {
    gap: spacing.sm,
  },
  sideButton: {
    paddingVertical: s(6),
    borderRadius: radius.md,
  },
  sideLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: s(16),
    color: colors.highlight,
  },
});
