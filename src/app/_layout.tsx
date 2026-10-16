import { useEffect, useLayoutEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/queryClient';
import { preloadSfx, UI_SFX } from '@/audio/sounds';
import { setFocusSoundEnabled, setPressEnabled } from '@/components/FocusableButton';
import GameMenu from '@/components/GameMenu';
import SplashOverlay from '@/components/SplashOverlay';
import { GameProvider } from '@/game/GameProvider';
import { useWebFonts } from '@/hooks/useWebFonts';
import { colors } from '@/theme';
import '@/i18n';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  useWebFonts();

  // Focus sounds and button presses stay off while the splash screen covers
  // the app. Driven by state rather than module code, so a fast refresh cannot
  // leave them off. A layout effect runs before the first native focus event reaches JS.
  useLayoutEffect(() => {
    setFocusSoundEnabled(!showSplash);
    setPressEnabled(!showSplash);
  }, [showSplash]);

  // Interface sounds load once the splash is gone: creating their players
  // during the intro delays its first frames on slow Android TV devices.
  useEffect(() => {
    if (!showSplash) preloadSfx(...UI_SFX);
  }, [showSplash]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <GameProvider>
        <Stack
          screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.background } }}
        />
        <GameMenu />
      </GameProvider>
      {showSplash && (
        <SplashOverlay
          onDone={() => setShowSplash(false)}
        />
      )}
    </QueryClientProvider>
  );
}
