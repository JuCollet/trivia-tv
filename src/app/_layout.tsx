import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/queryClient';
import { preloadSfx, UI_SFX } from '@/audio/sounds';
import { setFocusSoundEnabled } from '@/components/FocusableButton';
import SplashOverlay from '@/components/SplashOverlay';
import { colors } from '@/theme';

preloadSfx(...UI_SFX);
setFocusSoundEnabled(false);

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.background } }}
      />
      {showSplash && (
        <SplashOverlay
          onDone={() => {
            setShowSplash(false);
            setFocusSoundEnabled(true);
          }}
        />
      )}
    </QueryClientProvider>
  );
}
