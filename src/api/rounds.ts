import { useQuery } from '@tanstack/react-query';
import { MOCK_ROUND } from '@/game/mock';
import type { ThemeRound } from '@/game/types';
import { API_URL, apiGet } from './client';
import { queryKeys } from './keys';

const GENERATION_POLL_MS = 2_000;

function fetchRound(roomCode: string, roundIndex: number, signal: AbortSignal): Promise<ThemeRound> {
  if (!API_URL) return Promise.resolve(MOCK_ROUND);
  return apiGet<ThemeRound>(`/rooms/${encodeURIComponent(roomCode)}/rounds/${roundIndex}`, signal);
}

// Round with its generated questions. While Claude is generating, we poll the server
// regularly; once the questions are there, they no longer change.
// The round index will come from the Socket.IO game state.
export function useRound(roomCode: string, roundIndex: number) {
  return useQuery({
    queryKey: queryKeys.rounds.detail(roomCode, roundIndex),
    queryFn: ({ signal }) => fetchRound(roomCode, roundIndex, signal),
    staleTime: Infinity,
    refetchInterval: (query) => (query.state.data?.questions.length === 0 ? GENERATION_POLL_MS : false),
  });
}
