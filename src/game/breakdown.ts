import type { TvView } from '@jucollet/trivia-client/schema';
import { STEAL_POINTS_PER_QUESTION } from './rules';

export type ScoreLine = NonNullable<TvView['result']>['scores'][number];

export type PointsReason =
  | 'correct'
  | 'wrong'
  | 'noAnswer'
  | 'masterFinders'
  | 'masterNobody'
  | 'masterWrong'
  | 'masterNoAnswer';

export type PointsBreakdownLine = {
  line: ScoreLine;
  reason: PointsReason;
  // Steal settled at the end of the round, so not in the score yet:
  // positive for the challenger who steals, negative for the master.
  steal: number;
};

// Explains each player's points on a question. Mirrors the server rules
// (Scoring and RoundAwards in trivia-server): keep them in sync.
export function breakdown(scores: ScoreLine[], masterId: string | null | undefined): PointsBreakdownLine[] {
  const master = scores.find((line) => line.playerId === masterId);
  const challengers = scores.filter((line) => line.playerId !== masterId);
  const stealer = master ? findStealer(challengers, master) : null;
  const stolen = stealer ? STEAL_POINTS_PER_QUESTION : 0;

  return scores
    .map((line) => ({
      line,
      reason: line === master ? masterReason(line, challengers) : challengerReason(line),
      steal: line === stealer ? stolen : line === master ? -stolen : 0,
    }))
    .sort((a, b) => b.line.points - a.line.points);
}

function challengerReason(line: ScoreLine): PointsReason {
  if (line.choice === null) return 'noAnswer';
  return line.correct ? 'correct' : 'wrong';
}

// The master doesn't score their own answer: when right, they get the
// 150 points per challenger who found it.
function masterReason(line: ScoreLine, challengers: ScoreLine[]): PointsReason {
  if (line.choice === null) return 'masterNoAnswer';
  if (!line.correct) return 'masterWrong';
  return challengers.some((c) => c.correct) ? 'masterFinders' : 'masterNobody';
}

// The fastest correct challenger steals from the master, unless the master
// answered correctly and faster.
function findStealer(challengers: ScoreLine[], master: ScoreLine): ScoreLine | null {
  const fastest = challengers
    .filter((line) => line.correct && line.responseMillis !== null)
    .sort((a, b) => (a.responseMillis ?? 0) - (b.responseMillis ?? 0))[0];
  if (!fastest) return null;
  const masterFaster =
    master.correct && master.responseMillis !== null && master.responseMillis <= (fastest.responseMillis ?? 0);
  return masterFaster ? null : fastest;
}
