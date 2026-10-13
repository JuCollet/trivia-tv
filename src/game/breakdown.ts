import type { TvView } from '@jucollet/trivia-client/schema';
import { MASTER_POINTS_PER_FINDER, STEAL_POINTS_PER_QUESTION } from './rules';

export type ScoreLine = NonNullable<TvView['result']>['scores'][number];

export type PointsPartKind =
  | 'correct'
  | 'speed'
  | 'wrong'
  | 'noAnswer'
  | 'masterFinders'
  | 'masterNobody'
  | 'masterWrong'
  | 'masterNoAnswer'
  | 'steals'
  | 'stolen';

// One source of points: positive when won, negative when lost, 0 to only
// explain why a player got nothing.
export type PointsPart = {
  kind: PointsPartKind;
  points: number;
  // masterFinders: how many challengers found the answer.
  count?: number;
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
      const parts = line === master ? masterParts(line, challengers, stealer) : challengerParts(line);
      if (master && line === stealer) {
        parts.push({ kind: 'steals', points: STEAL_POINTS_PER_QUESTION, otherId: master.playerId });
      }
      return { line, parts };
    })
    .sort((a, b) => b.line.points - a.line.points);
}

function challengerParts(line: ScoreLine): PointsPart[] {
  if (line.choice === null) return [{ kind: 'noAnswer', points: 0 }];
  if (!line.correct) return [{ kind: 'wrong', points: -line.speedBonus }];
  const parts: PointsPart[] = [{ kind: 'correct', points: line.basePoints }];
  if (line.speedBonus > 0) parts.push({ kind: 'speed', points: line.speedBonus });
  return parts;
}

// The master doesn't score their own answer: when right, they get the
// 150 points per challenger who found it. A steal is then taken from them.
function masterParts(line: ScoreLine, challengers: ScoreLine[], stealer: ScoreLine | null): PointsPart[] {
  const finders = challengers.filter((c) => c.correct).length;
  const parts: PointsPart[] =
    line.choice === null
      ? [{ kind: 'masterNoAnswer', points: 0 }]
      : !line.correct
        ? [{ kind: 'masterWrong', points: 0 }]
        : finders > 0
          ? [{ kind: 'masterFinders', points: finders * MASTER_POINTS_PER_FINDER, count: finders }]
          : [{ kind: 'masterNobody', points: 0 }];
  if (stealer) parts.push({ kind: 'stolen', points: -STEAL_POINTS_PER_QUESTION, otherId: stealer.playerId });
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
