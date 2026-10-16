import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Ionicons } from '@expo/vector-icons';
import { MUSIC } from '@/audio/sounds';
import AppText from '@/components/AppText';
import FocusableButton from '@/components/FocusableButton';
import PlayerSlot from '@/components/PlayerSlot';
import QrCode from '@/components/QrCode';
import Screen from '@/components/Screen';
import RulesCarousel from '@/components/RulesCarousel';
import SettingsDialog, { languageLabel } from '@/components/SettingsDialog';
import { JOIN_URL, joinLink } from '@/api/client';
import LoadingScreen from '@/components/LoadingScreen';
import { useGame } from '@/game/GameProvider';
import { estimateGameMinutes, MAX_PLAYERS, MIN_PLAYERS } from '@/game/rules';
import type { GameSettings, Player } from '@/game/types';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { setLanguage } from '@/i18n';
import { colors, fonts, radius, s, spacing } from '@/theme';

const BACKGROUND = require('../../assets/images/backgrounds/neutral.jpg');
const SLOTS_PER_ROW = MAX_PLAYERS / 2;
// Shown without the scheme, for players who type the address and the code.
const JOIN_HOST = JOIN_URL.replace(/^https?:\/\//, '');

// TV screen 1: the room is created as soon as the app opens. Players join with
// the QR code or the room code and enter their themes in secret on their phone;
// the host tweaks the settings and starts the game with the remote.
export default function TvLobby() {
  useBackgroundMusic(MUSIC.lobby, 0.4);
  const { t } = useTranslation();
  const game = useGame();
  const [draft, setDraft] = useState<GameSettings>(game.settings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  // The chips follow the dialog while it is open.
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
  const players: Player[] = game.view.players.map((p) => ({
    id: p.id,
    name: p.name,
    score: p.score,
    themesEntered: p.themeCount,
  }));
  const minutes = estimateGameMinutes(settings, players.length);
  const colorsById = new Map(game.view.players.map((p) => [p.id, p.color]));
  const readyCount = game.view.players.filter((p) => p.themesReady).length;
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
    <Screen background={BACKGROUND}>
      <View style={styles.chips}>
        <Chip icon="timer-outline" accent>
          {minutes === null ? t('lobby.durationUnknown') : t('lobby.duration', { minutes })}
        </Chip>
        <Chip icon="list">
          {t('lobby.rounds', { count: settings.rounds })} • {t('lobby.questions', { count: settings.questionsPerTheme })}{' '}
          • {t('common.seconds', { count: settings.timerSeconds })}
        </Chip>
        <Chip icon="globe-outline">{languageLabel(settings.language)}</Chip>
      </View>

      <View style={styles.main}>
        <View style={[styles.panel, styles.playersPanel]}>
          <View>
            <AppText variant="hero" style={styles.title}>
              {t('lobby.titleStart')}
              <Text style={styles.titleHighlight}>{t('lobby.titleHighlight')}</Text>
            </AppText>
            <AppText style={styles.subtitle}>
              {t('lobby.players', { count: players.length })} •{' '}
              {t('lobby.playerRange', { min: MIN_PLAYERS, max: MAX_PLAYERS })}
            </AppText>
          </View>
          <PlayerGrid players={players} colorsById={colorsById} themesNeeded={settings.rounds} />
          <View style={styles.info}>
            <Ionicons name="information-circle" size={s(18)} color={colors.highlight} />
            <AppText style={styles.infoText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              {lobbyInfo(t, players, readyCount)}
            </AppText>
          </View>
        </View>

        <View style={[styles.panel, styles.joinPanel]}>
          <AppText variant="display" style={styles.joinTitle}>
            <Text style={styles.joinHighlight}>{t('lobby.joinHighlight')}</Text> {t('lobby.joinRest')}
          </AppText>
          <QrCode value={joinLink(code)} size={s(170)} style={styles.qr} />
          <AppText style={styles.scanText}>
            {t('lobby.scan')},{'\n'}
            {t('lobby.nothingToInstall')}
          </AppText>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <AppText style={styles.dividerText}>{t('lobby.orUrl', { host: JOIN_HOST })}</AppText>
            <View style={styles.dividerLine} />
          </View>
          <View style={styles.code}>
            <AppText variant="hero" style={styles.codeText}>
              {code}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <FocusableButton
          label={t('lobby.rules')}
          icon="book"
          variant="outline"
          onPress={() => setRulesOpen(true)}
          style={styles.settingsButton}
          labelStyle={styles.settingsLabel}
        />
        <FocusableButton
          label={t('lobby.settings')}
          icon="settings-sharp"
          variant="outline"
          onPress={openSettings}
          hasTVPreferredFocus={!canStart}
          style={styles.settingsButton}
          labelStyle={styles.settingsLabel}
        />
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

function Chip({
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
    <View style={styles.chip}>
      <Ionicons name={icon} size={s(16)} color={color} />
      <AppText style={[styles.chipText, { color }]}>{children}</AppText>
    </View>
  );
}

// Every seat of the room: joined players first, then free seats.
function PlayerGrid({
  players,
  colorsById,
  themesNeeded,
}: {
  players: Player[];
  colorsById: Map<string, string>;
  themesNeeded: number;
}) {
  // Past one row of players, the cards shrink so both rows fit the panel.
  const compact = players.length > SLOTS_PER_ROW;
  const rows = [0, SLOTS_PER_ROW].map((start) =>
    Array.from({ length: SLOTS_PER_ROW }, (_, i) => start + i),
  );
  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        // A row of free seats only takes the height left over.
        <View key={row[0]} style={[styles.gridRow, row[0] >= players.length && styles.freeRow]}>
          {row.map((seat) => {
            const player = players[seat];
            return player ? (
              <PlayerSlot
                key={player.id}
                player={player}
                color={colorsById.get(player.id) ?? colors.players[seat % colors.players.length]}
                isHost={false}
                themesNeeded={themesNeeded}
                compact={compact}
              />
            ) : (
              // The first free seat invites the next player to scan the code.
              <PlayerSlot key={seat} hint={seat === players.length} />
            );
          })}
        </View>
      ))}
    </View>
  );
}

function lobbyInfo(t: TFunction, players: Player[], readyCount: number): string {
  const missing = MIN_PLAYERS - players.length;
  if (missing > 0) return t('lobby.missingPlayers', { count: missing });
  if (readyCount === players.length) return t('lobby.allThemesReady');
  return t('lobby.themesReady', { count: readyCount, total: players.length });
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: s(5),
    borderRadius: s(20),
    borderWidth: s(1.5),
    borderColor: colors.panelBorder,
    backgroundColor: colors.panel,
  },
  chipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: s(14),
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  panel: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: s(1.5),
    borderColor: colors.panelBorder,
    backgroundColor: colors.panel,
  },
  playersPanel: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  title: {
    fontSize: s(36),
    lineHeight: s(42),
  },
  titleHighlight: {
    color: colors.highlight,
  },
  subtitle: {
    fontFamily: fonts.bodySemiBold,
    color: colors.highlight,
  },
  grid: {
    flex: 1,
    gap: spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  freeRow: {
    flex: 1,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: s(20),
    borderWidth: s(1.5),
    borderColor: colors.panelBorder,
  },
  infoText: {
    flex: 1,
    fontSize: s(13),
  },
  joinPanel: {
    width: s(270),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  joinTitle: {
    fontSize: s(26),
  },
  joinHighlight: {
    color: colors.accent,
  },
  qr: {
    borderWidth: s(5),
    borderColor: colors.accent,
  },
  scanText: {
    fontFamily: fonts.bodyMedium,
    fontSize: s(14),
    color: colors.highlight,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  dividerLine: {
    flex: 1,
    height: s(1),
    backgroundColor: colors.panelBorder,
  },
  dividerText: {
    fontFamily: fonts.bodyMedium,
    fontSize: s(13),
    color: colors.highlight,
  },
  code: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    borderRadius: s(28),
    borderWidth: s(1.5),
    borderColor: colors.panelBorder,
    backgroundColor: colors.background,
  },
  codeText: {
    fontSize: s(36),
    letterSpacing: s(3),
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  settingsButton: {
    width: s(170),
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  settingsLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: s(18),
    color: colors.highlight,
  },
  launchButton: {
    width: s(310),
  },
  launchLabel: {
    fontSize: s(34),
  },
});
