import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';
import FocusableButton from './FocusableButton';
import Screen from './Screen';
import { colors, fonts, radius, s, spacing } from '@/theme';

type Props = {
  onDone: () => void;
};

// Shown once when the game starts: the questions come from an AI and can be
// wrong. Stays until the host presses OK on the remote, so everyone can read it.
export default function AiDisclaimer({ onDone }: Props) {
  const { t } = useTranslation();

  return (
    <Screen centered>
      <View style={styles.card}>
        <Ionicons name="sparkles" size={s(40)} color={colors.accent} />
        <AppText variant="display" style={styles.center}>
          {t('disclaimer.title')}
        </AppText>
        <AppText style={[styles.center, styles.text]}>{t('disclaimer.text')}</AppText>
        <AppText style={[styles.center, styles.fun]}>{t('disclaimer.fun')}</AppText>
        <FocusableButton
          label={t('disclaimer.ok')}
          icon="play"
          onPress={onDone}
          sound="start"
          hasTVPreferredFocus
          style={styles.button}
          labelStyle={styles.buttonLabel}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    width: s(620),
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: s(1.5),
    borderColor: colors.panelBorder,
    backgroundColor: colors.panel,
  },
  center: {
    textAlign: 'center',
  },
  text: {
    fontSize: s(18),
  },
  fun: {
    fontFamily: fonts.bodySemiBold,
    fontSize: s(18),
    color: colors.highlight,
  },
  button: {
    marginTop: spacing.sm,
    minWidth: s(260),
  },
  buttonLabel: {
    fontSize: s(24),
  },
});
