import { ActivityIndicator } from 'react-native';
import AppText from '@/components/AppText';
import FocusableButton from '@/components/FocusableButton';
import Screen from '@/components/Screen';
import { colors } from '@/theme';

type Props = {
  message?: string;
  error?: Error | null;
  onRetry?: () => void;
};

// Network loading or failure state, with a retry button.
export default function LoadingScreen({ message, error, onRetry }: Props) {
  return (
    <Screen centered>
      {error ? (
        <>
          <AppText variant="title">Impossible de charger la partie</AppText>
          <AppText muted>{error.message}</AppText>
          {onRetry && <FocusableButton label="Réessayer" onPress={onRetry} hasTVPreferredFocus />}
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.accent} />
          {message && <AppText muted>{message}</AppText>}
        </>
      )}
    </Screen>
  );
}
