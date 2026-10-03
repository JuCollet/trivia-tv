import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { playSfx, stopSfx, type SfxName } from '@/audio/sounds';

// Plays a sound effect once when the screen gets focus, and again whenever
// `name` or `trigger` changes while it is focused (null: no sound).
// The sound is cut if the screen loses focus before it ends.
export function useScreenSfx(name: SfxName | null, volume = 1, trigger?: unknown) {
  useFocusEffect(
    useCallback(() => {
      if (!name) return;
      void playSfx(name, volume);
      return () => stopSfx(name);
      // `trigger` only exists to replay the sound when it changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, volume, trigger]),
  );
}
