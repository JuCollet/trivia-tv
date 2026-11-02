import type { TvView } from '@jucollet/trivia-client/schema';
import { STEAL_POINTS_PER_QUESTION } from './rules';

export type ScoreLine = NonNullable<TvView['result']>['scores'][number];

export type PointsPartKind =
  | 'correct'
  | 'speed'
  | 'wrong'
  | 'noAnswer'
  | 'steals'
  | 'stolen';

// One source of points: positive when won, negative when lost, 0 to only
// explain why a player got nothing.
export type PointsPart = {
  kind: PointsPartKind;
  points: number;
  // steals and stolen: the other player of the steal.
  otherId?: string;
};

export type PointsBreakdownLine = {
  line: ScoreLine;
  parts: PointsPart[];
};

// Explains each player's points on a question. The parts add up to
// `line.points`, which already includes the steal. Mirrors the server rules
// (Scoring in trivia-server): keep them in sync.
export function breakdown(scores: ScoreLine[], masterId: string | null | undefined): PointsBreakdownLine[] {
  const master = scores.find((line) => line.playerId === masterId);
  const challengers = scores.filter((line) => line.playerId !== masterId);
  const stealer = master ? findStealer(challengers, master) : null;

  return scores
    .map((line) => {
      // The master scores their own answer like everyone, minus a steal.
      const parts = answerParts(line);
      if (master && line === master && stealer) {
        parts.push({ kind: 'stolen', points: -STEAL_POINTS_PER_QUESTION, otherId: stealer.playerId });
      }
      if (master && line === stealer) {
        parts.push({ kind: 'steals', points: STEAL_POINTS_PER_QUESTION, otherId: master.playerId });
      }
      return { line, parts };
    })
    .sort((a, b) => b.line.points - a.line.points);
}

// A wrong answer's speedBonus is what it lost (half the bonus).
function answerParts(line: ScoreLine): PointsPart[] {
  if (line.choice === null) return [{ kind: 'noAnswer', points: 0 }];
  if (!line.correct) return [{ kind: 'wrong', points: -line.speedBonus }];
  const parts: PointsPart[] = [{ kind: 'correct', points: line.basePoints }];
  if (line.speedBonus > 0) parts.push({ kind: 'speed', points: line.speedBonus });
  return parts;
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
