import type { Award, Player, ThemeRound } from './types';

// Mock data to prototype the screens before wiring up the server.
// MOCK_ROUND is also the default response when EXPO_PUBLIC_API_URL isn't set.

export const MOCK_ROOM_CODE = 'BRIE';
export const MOCK_ROUND_INDEX = 0;

export const MOCK_PLAYERS: Player[] = [
  { id: 'p1', name: 'Julien', score: 2450, themesReady: true },
  { id: 'p2', name: 'Camille', score: 2100, themesReady: true },
  { id: 'p3', name: 'Sam', score: 1720, themesReady: false },
  { id: 'p4', name: 'Léa', score: 980, themesReady: true },
];

export const MOCK_ROUND: ThemeRound = {
  theme: 'Les fromages',
  masterId: 'p2',
  questions: [
    {
      question: 'Quel fromage est traditionnellement affiné dans les caves de Roquefort ?',
      choices: ['Le comté', 'Le roquefort', 'Le reblochon', 'Le brie'],
      answerIndex: 1,
      explanation: 'Le roquefort mûrit dans les caves naturelles du Combalou, en Aveyron.',
    },
  ],
};

export const MOCK_AWARDS: Award[] = [
  { id: 'bonTheme', playerId: 'p2', points: 900 },
  { id: 'plusViteQueSonOmbre', playerId: 'p1', points: 300 },
  { id: 'outsider', playerId: 'p4', points: 200 },
  { id: 'bonnetDane', playerId: 'p3', points: 0 },
  { id: 'seulContreTous', playerId: 'p1', points: 150 },
];

export const playerName = (id: string) => MOCK_PLAYERS.find((p) => p.id === id)?.name ?? '?';
