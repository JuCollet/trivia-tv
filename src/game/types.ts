export type Language = 'fr' | 'en';

export type GameSettings = {
  language: Language;
  questionsPerTheme: number;
  rounds: number;
  timerSeconds: number;
};

export type Player = {
  id: string;
  name: string;
  score: number;
  // Themes already typed in secret on the phone, one per round.
  themesEntered: number;
};

export type Question = {
  question: string;
  choices: [string, string, string, string];
  answerIndex: number;
  explanation: string;
};

export type ThemeRound = {
  theme: string;
  masterId: string;
  questions: Question[];
};

export type AwardId =
  | 'plusViteQueSonOmbre'
  | 'outsider'
  | 'seulContreTous'
  | 'pasMonTruc'
  | 'bonnetDane';

export type Award = {
  id: AwardId;
  playerId: string;
  points: number;
};
