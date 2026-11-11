import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { MUSIC } from '@/audio/sounds';
import AppText from '@/components/AppText';
import FocusableButton, { GO_RING } from '@/components/FocusableButton';
import PlayerSlot, { type LobbyPlayer } from '@/components/PlayerSlot';
import Pop, { POP_STAGGER_MS } from '@/components/Pop';
import QrCode from '@/components/QrCode';
import Screen from '@/components/Screen';
import RulesCarousel from '@/components/RulesCarousel';
import SettingsDialog from '@/components/SettingsDialog';
import { JOIN_URL, joinLink } from '@/api/client';
import LoadingScreen from '@/components/LoadingScreen';
import { useGame } from '@/game/GameProvider';
import { estimateGameMinutes, MAX_PLAYERS, MIN_PLAYERS } from '@/game/rules';
import type { GameSettings } from '@/game/types';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { setLanguage } from '@/i18n';
import { colors, fonts, s, spacing } from '@/theme';

const BACKGROUND = require('../../assets/images/backgrounds/neutral.jpg');
const SLOTS_PER_ROW = MAX_PLAYERS / 2;
const SEAT_SIZE = s(100);
// Same gap above, right of and below the sidebar card.
const CARD_MARGIN = s(32);
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
// Left: who is playing, with a line saying what the game still waits for.
// Right: a card with how to join, the settings summary, the rules and the settings.
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
        <View style={styles.heading}>
          <AppText variant="hero" style={styles.title}>
            {t('lobby.titleStart')}
            <Text style={styles.titleHighlight}>{t(`lobby.title_${part}`)}</Text>
          </AppText>
          <Status players={players} />
        </View>

        <View style={styles.stage}>
          <PlayerGrid players={players} />
        </View>

        <FocusableButton
          label={t('lobby.launch')}
          icon="play"
          variant="go"
          onPress={game.start}
          disabled={!canStart}
          sound="start"
          hasTVPreferredFocus={canStart}
          style={styles.go}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardBody}>
          <AppText variant="display" style={styles.joinTitle}>
            <Text style={styles.joinHighlight}>{t('lobby.joinHighlight')}</Text> {t('lobby.joinRest')}
          </AppText>
          <View style={styles.join}>
            <QrCode value={joinLink(code)} size={s(116)} style={styles.qr} />
            <View style={styles.code}>
              <AppText variant="hero" style={styles.codeText}>
                {code}
              </AppText>
            </View>
            <AppText style={styles.scanText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {t('lobby.orUrl', { host: JOIN_HOST })}
            </AppText>
          </View>

          <View style={styles.infos}>
            <Info icon="timer-outline" accent>
              {minutes === null ? t('lobby.durationUnknown') : t('lobby.duration', { minutes })}
            </Info>
            <Info icon="layers-outline">{t('lobby.rounds', { count: settings.rounds })}</Info>
            <Info icon="help-circle-outline">{t('lobby.questions', { count: settings.questionsPerTheme })}</Info>
            <Info icon="stopwatch-outline">{t('lobby.timer', { count: settings.timerSeconds })}</Info>
          </View>
        </View>

        <View style={styles.footer}>
          <FocusableButton
            label={t('lobby.rules')}
            icon="book"
            variant="footer"
            onPress={() => setRulesOpen(true)}
            style={styles.footerButton}
          />
          <View style={styles.footerDivider} />
          <FocusableButton
            label={t('lobby.settings')}
            icon="settings-sharp"
            variant="footer"
            onPress={openSettings}
            hasTVPreferredFocus={!canStart}
            style={styles.footerButton}
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

// One full-width chip of the settings summary. The language is left out: the
// interface already speaks it.
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
    <View style={[styles.info, accent && styles.infoAccent]}>
      <Ionicons name={icon} size={s(16)} color={color} />
      <AppText style={[styles.infoText, { color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {children}
      </AppText>
    </View>
  );
}

// Every seat of the room, two rows of round avatars: joined players first,
// then free seats. Each player pops in once, the first time the grid shows
// them: on opening, the seated players one after the other (same pop and
// stagger as the awards); later, only whoever just joined. A player who is
// already shown never pops again, even when a departure moves them to
// another seat or row, or while their phone is disconnected.
function PlayerGrid({ players }: { players: LobbyPlayer[] }) {
  // Who just arrived, worked out when the seated players change (during the
  // render, so the new seats mount with it). Whoever left is forgotten: if
  // they join again, they pop again.
  const ids = players.map((p) => p.id);
  const [seated, setSeated] = useState({ ids: [] as string[], fresh: [] as string[] });
  if (ids.join() !== seated.ids.join()) {
    setSeated({ ids, fresh: ids.filter((id) => !seated.ids.includes(id)) });
  }
  const popDelay = (id: string) => {
    const i = seated.fresh.indexOf(id);
    return i < 0 ? null : i * POP_STAGGER_MS;
  };
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
              <Pop key={player.id} delay={popDelay(player.id)}>
                <PlayerSlot player={player} size={SEAT_SIZE} />
              </Pop>
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

// What the game still waits for: more players, then the themes of one or
// several players, until everyone is ready.
function Status({ players }: { players: LobbyPlayer[] }) {
  const { t } = useTranslation();
  const missing = MIN_PLAYERS - players.length;
  const waiting = players.filter((p) => !p.ready);
  const text =
    missing > 0
      ? t('lobby.status.missingPlayers', { count: missing })
      : waiting.length === 1
        ? t('lobby.status.waitingFor', { name: waiting[0].name })
        : waiting.length > 1
          ? t('lobby.status.waitingCount', { count: waiting.length })
          : t('lobby.status.ready');
  return (
    <AppText style={styles.status} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
      {text}
    </AppText>
  );
}

const styles = StyleSheet.create({
  // The card keeps the same gap to the top, right and bottom edges; the left
  // side keeps the safe area and centers its content in what remains.
  screen: {
    flexDirection: 'row',
    gap: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingVertical: 0,
  },
  // Title at the top and GO at the bottom, lined up with the card's edges;
  // the avatars are centered between the status line and GO.
  left: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: CARD_MARGIN,
  },
  heading: {
    alignItems: 'center',
    // Lilita's line box leaves room above the capitals: pull it up so they
    // line up with the top of the card.
    marginTop: -s(6),
  },
  title: {
    fontSize: s(46),
    lineHeight: s(52),
  },
  titleHighlight: {
    color: colors.highlight,
  },
  status: {
    fontFamily: fonts.bodySemiBold,
    fontSize: s(17),
    color: colors.highlight,
    marginTop: s(4),
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    gap: s(10),
  },
  gridRow: {
    flexDirection: 'row',
    gap: s(18),
  },
  // The face, not its focus ring, lines up with the bottom of the card.
  go: {
    marginBottom: -GO_RING,
  },
  card: {
    width: s(252),
    marginVertical: CARD_MARGIN,
    marginRight: CARD_MARGIN,
    borderRadius: s(22),
    borderWidth: s(1.5),
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: s(18),
    paddingTop: s(16),
    paddingBottom: s(16),
  },
  joinTitle: {
    fontSize: s(22),
    lineHeight: s(26),
    textAlign: 'center',
  },
  joinHighlight: {
    color: colors.accent,
  },
  join: {
    alignItems: 'center',
    gap: s(10),
    marginTop: s(12),
  },
  qr: {
    borderWidth: s(4),
    borderColor: colors.accent,
  },
  code: {
    width: s(150),
    height: s(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(10),
    backgroundColor: colors.accent,
  },
  codeText: {
    fontSize: s(21),
    lineHeight: s(26),
    letterSpacing: s(5),
    color: colors.onBright,
  },
  scanText: {
    fontFamily: fonts.bodyMedium,
    fontSize: s(12),
    color: colors.highlight,
    textAlign: 'center',
  },
  // Full-width chips, centered in the room left between the code and the footer.
  infos: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: s(4),
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: s(6),
    paddingHorizontal: s(12),
    borderRadius: s(12),
    backgroundColor: colors.chip,
  },
  infoAccent: {
    backgroundColor: colors.chipAccent,
  },
  infoText: {
    flexShrink: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: s(15),
  },
  // Rules and Settings share the bottom of the card, half its width each.
  footer: {
    flexDirection: 'row',
    height: s(46),
    borderTopWidth: s(1.5),
    borderTopColor: colors.cardBorder,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 0,
  },
  footerDivider: {
    width: s(1.5),
    backgroundColor: colors.cardBorder,
  },
});
