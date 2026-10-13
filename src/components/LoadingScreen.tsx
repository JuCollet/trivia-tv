import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <Screen centered>
      {error ? (
        <>
          <AppText variant="title">{t('common.loadError')}</AppText>
          <AppText muted>{error.message}</AppText>
          {onRetry && <FocusableButton label={t('common.retry')} onPress={onRetry} hasTVPreferredFocus />}
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
