import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { router, usePathname, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { GamePhase, SettingsView, TvView } from '@jucollet/trivia-client/schema';
import { CloseCode, connectTv, type TvConnection } from '@jucollet/trivia-client/ws';
import { api, API_URL } from '@/api/client';
import { setLanguage } from '@/i18n';
import { DEFAULT_SETTINGS } from './rules';
import type { GameSettings, Language } from './types';

const RETRY_DELAYS_MS = [500, 1_000, 2_000, 4_000, 8_000];

// The server owns the state machine: each phase has its screen.
const PHASE_ROUTES: Record<GamePhase, Href> = {
  LOBBY: '/',
  THEME_REVEAL: '/theme',
  QUESTION: '/question',
  FINAL_QUESTION: '/question',
  QUESTION_RESULT: '/results',
  ROUND_END: '/awards',
  PODIUM: '/finale',
};

type HostedGame = { code: string; hostToken: string; settings: GameSettings };

// Translated on render, so that it follows the interface language.
type GameError = { key: 'createFailed' } | { key: 'unreachable'; url: string };

type GameContextValue = {
  // Last state pushed by the server, null until the TV is connected.
  view: TvView | null;
  settings: GameSettings;
  error: string | null;
  // Themes revealed so far in this game, shown again on the final question's slot machine.
  playedThemes: string[];
  // Creates a new game, replacing the current one: the phones connected to
  // the current one follow it with the same name and avatar.
  newGame: (settings?: GameSettings) => void;
  // Changes the settings in the lobby, even after players entered their themes.
  changeSettings: (settings: GameSettings) => void;
  start: () => void;
  next: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

// Creates the game on the server, keeps the TV connected to it and shows the
// screen of the current phase.
export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<HostedGame | null>(null);
  const [view, setView] = useState<TvView | null>(null);
  const [error, setError] = useState<GameError | null>(null);
  // Settings sent to the server but not confirmed yet: a new game being
  // created, or a change waiting for the next state. Shown right away, so the
  // interface language does not flick back meanwhile.
  const [requested, setRequested] = useState<GameSettings | null>(null);
  const [changed, setChanged] = useState<GameSettings | null>(null);
  const connection = useRef<TvConnection | null>(null);
  const creating = useRef(0);
  const { t } = useTranslation();
  // The server's settings once connected: they change live in the lobby.
  const settings =
    requested ?? changed ?? (view ? toGameSettings(view.settings) : (game?.settings ?? DEFAULT_SETTINGS));
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  });

  useEffect(() => setLanguage(settings.language), [settings.language]);

  const createGame = useCallback((gameSettings: GameSettings = DEFAULT_SETTINGS, replace = false) => {
    const attempt = ++creating.current;
    void requestGame(gameSettings).then((result) => {
      if (attempt !== creating.current) return;
      setRequested(null);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      // Sent before the old connection closes: its phones learn the new code.
      if (replace) connection.current?.replace({ code: result.code, hostToken: result.hostToken });
      setError(null);
      setView(null);
      setGame(result);
    });
  }, []);

  useEffect(() => createGame(), [createGame]);

  useEffect(() => {
    if (!game) return;
    let disposed = false;
    let attempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      connection.current = connectTv({
        baseUrl: API_URL,
        code: game.code,
        hostToken: game.hostToken,
        onOpen: () => {
          attempt = 0;
        },
        onState: (state) => {
          if (disposed) return;
          setView(state);
          setChanged(null);
        },
        onError: (e) => console.warn(`[game] ${e.code}: ${e.message}`),
        onClose: ({ code }) => {
          if (disposed) return;
          // The server forgot the game (restart, purge): start a new one.
          if (code === CloseCode.NOT_FOUND || code === CloseCode.NOT_HOST) {
            createGame(settingsRef.current);
            return;
          }
          const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
          attempt += 1;
          retryTimer = setTimeout(connect, delay);
        },
      });
    };
    connect();

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      connection.current?.close();
      connection.current = null;
    };
  }, [game, createGame]);

  // Kept on the TV: the server sends the theme of the current round only.
  const [played, setPlayed] = useState<{ game: HostedGame | null; themes: string[] }>({ game: null, themes: [] });
  const roundTheme = view?.round && !view.round.isFinal ? view.round.theme : null;
  if (played.game !== game) {
    setPlayed({ game, themes: [] });
  } else if (roundTheme && !played.themes.includes(roundTheme)) {
    setPlayed({ game, themes: [...played.themes, roundTheme] });
  }

  const phase = view?.phase;
  const pathname = usePathname();
  useEffect(() => {
    if (!phase) return;
    const route = PHASE_ROUTES[phase];
    if (route !== pathname) router.replace(route);
    // Only a new phase moves to another screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const value: GameContextValue = {
    view,
    settings,
    playedThemes: played.themes,
    error: error && (error.key === 'unreachable' ? t('errors.unreachable', { url: error.url }) : t('errors.createFailed')),
    newGame: (next = settings) => {
      setRequested(next);
      createGame(next, true);
    },
    changeSettings: (next) => {
      if (!connection.current) return;
      setChanged(next);
      connection.current.changeSettings(next);
    },
    start: () => connection.current?.start(),
    next: () => connection.current?.next(),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

async function requestGame(settings: GameSettings): Promise<HostedGame | { error: GameError }> {
  try {
    const { data } = await api.POST('/games', { body: settings });
    if (!data) return { error: { key: 'createFailed' } };
    return { code: data.code, hostToken: data.hostToken, settings };
  } catch {
    return { error: { key: 'unreachable', url: API_URL } };
  }
}

function toGameSettings(view: SettingsView): GameSettings {
  const { questionsPerTheme, rounds, timerSeconds } = view;
  return { language: view.language as Language, questionsPerTheme, rounds, timerSeconds };
}

export function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error('useGame must be used inside GameProvider');
  return value;
}

export function playerName(view: TvView, playerId: string | null | undefined): string {
  return view.players.find((p) => p.id === playerId)?.name ?? '?';
}
