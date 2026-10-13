import type { Award, AwardId, GameSettings } from './types';

// Starting values from the spec, to be tuned during playtesting.
export const DEFAULT_SETTINGS: GameSettings = {
  language: 'fr',
  questionsPerTheme: 3,
  rounds: 2,
  timerSeconds: 15,
};

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;
export const MAX_THEME_LENGTH = 60;
export const ROOM_CODE_LENGTH = 4;
// Points the fastest correct challenger steals from the master on each question.
export const STEAL_POINTS_PER_QUESTION = 200;
export const MASTER_POINTS_PER_FINDER = 150;

// Rough game length shown in the lobby: each question adds its timer plus the
// answer reveal, each theme adds its announcement and end-of-round awards,
// and the mystery final closes the game.
const SECONDS_AFTER_QUESTION = 30;
const SECONDS_PER_THEME = 45;
const SECONDS_FINALE = 120;

// Based on the players who joined, so it grows as they arrive. Null while
// nobody has joined: there is nothing to estimate yet.
export function estimateGameMinutes(settings: GameSettings, playerCount: number): number | null {
  if (playerCount === 0) return null;
  const themes = settings.rounds * playerCount;
  const questions = themes * settings.questionsPerTheme;
  const seconds =
    questions * (settings.timerSeconds + SECONDS_AFTER_QUESTION) + themes * SECONDS_PER_THEME + SECONDS_FINALE;
  // Rounded to the minute, so that each setting visibly changes it.
  return Math.max(1, Math.round(seconds / 60));
}

const MAX_PRIZES_SHOWN = 3;
const STEAL: AwardId = 'plusViteQueSonOmbre';

// Spec order: steals, then at most 3 awards, those with points first.
// All points apply, even those that aren't shown.
export function roundAwardsToShow(awards: Award[]): Award[] {
  const steals = awards.filter((a) => a.id === STEAL);
  const prizes = awards
    .filter((a) => a.id !== STEAL)
    .sort((a, b) => Number(b.points !== 0) - Number(a.points !== 0))
    .slice(0, MAX_PRIZES_SHOWN);
  return [...steals, ...prizes];
}
