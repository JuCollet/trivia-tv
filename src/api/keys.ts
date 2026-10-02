// Centralized cache keys: a single source for reading and invalidating.
export const queryKeys = {
  rounds: {
    all: ['rounds'] as const,
    byRoom: (roomCode: string) => [...queryKeys.rounds.all, roomCode] as const,
    detail: (roomCode: string, roundIndex: number) => [...queryKeys.rounds.byRoom(roomCode), roundIndex] as const,
  },
};
