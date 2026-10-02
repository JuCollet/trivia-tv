import { AppState, Platform } from 'react-native';
import { focusManager, QueryClient } from '@tanstack/react-query';
import { ApiError } from './client';

const MAX_RETRIES = 2;

// A 4xx error won't fix itself: no point retrying.
const shouldRetry = (failureCount: number, error: Error) =>
  failureCount < MAX_RETRIES && !(error instanceof ApiError && error.status < 500);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
    },
  },
});

// On TV there's no window "focus" event: we rely on the app state instead.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (status) => focusManager.setFocused(status === 'active'));
}
