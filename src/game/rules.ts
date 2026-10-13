import type { Award, AwardId, GameSettings } from './types';

// Starting values from the spec, to be tuned during playtesting.
export const DEFAULT_SETTINGS: GameSettings = {
  language: 'fr',
  questionsPerTheme: 3,
  rounds: 2,
  timerSeconds: 15,
};

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 10;
export const MAX_THEME_LENGTH = 60;
export const ROOM_CODE_LENGTH = 4;

export const AWARDS: Record<AwardId, { label: string; description: string }> = {
  bonTheme: {
    label: 'Bonus bon thème',
    description: 'Entre 50 % et 80 % de bonnes réponses sur la manche : +300 par question pour le maître.',
  },
  plusViteQueSonOmbre: {
    label: 'Plus vite que son ombre',
    description: 'Le plus rapide à bien répondre, devant le maître : il lui vole 100 points par question.',
  },
  outsider: {
    label: "L'Outsider",
    description: 'Sans-faute sur la manche : +200.',
  },
  seulContreTous: {
    label: 'Seul contre tous',
    description: 'Seul challenger à trouver une question : +150 par question.',
  },
  pasMonTruc: {
    label: 'Finalement pas mon truc',
    description: 'Le maître ne trouve aucune réponse sur son propre thème : −200.',
  },
  bonnetDane: {
    label: "Bonnet d'âne",
    description: 'Aucune bonne réponse sur la manche : badge seul.',
  },
};

const MAX_PRIZES_SHOWN = 3;
const MASTER_AWARDS: AwardId[] = ['bonTheme', 'plusViteQueSonOmbre'];

// Spec order: master bonus, steal, then at most 3 awards, those with points first.
// All points apply, even those that aren't shown.
export function roundAwardsToShow(awards: Award[]): Award[] {
  const master = MASTER_AWARDS.flatMap((id) => awards.filter((a) => a.id === id));
  const prizes = awards
    .filter((a) => !MASTER_AWARDS.includes(a.id))
    .sort((a, b) => Number(b.points !== 0) - Number(a.points !== 0))
    .slice(0, MAX_PRIZES_SHOWN);
  return [...master, ...prizes];
}
