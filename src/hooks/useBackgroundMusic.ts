import { useCallback } from 'react';
import { type AudioSource } from 'expo-audio';
import { useFocusEffect } from 'expo-router';
import { playMusic, stopMusic } from '@/audio/sounds';

// Plays a looping background track while the screen is focused,
// and stops it as soon as another screen takes over.
export function useBackgroundMusic(source: AudioSource, volume = 0.5) {
  useFocusEffect(
    useCallback(() => {
      playMusic(source, volume);
      return () => stopMusic(source);
    }, [source, volume]),
  );
}
