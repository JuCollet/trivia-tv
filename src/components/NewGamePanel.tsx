import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';
import FocusableButton from './FocusableButton';
import OptionPicker from './OptionPicker';
import type { Language } from '@/game/types';
import { colors, spacing } from '@/theme';

export const LANGUAGES: readonly Language[] = ['fr', 'en'];

// Each language is named in itself, whatever the interface language.
export const languageLabel = (language: Language) => (language === 'fr' ? 'Français' : 'English');

type Props = {
  language: Language;
  // Label of the button that leaves without starting over.
  cancelLabel: string;
  onCancel: () => void;
  onConfirm: (language: Language) => void;
};

// Confirmation before starting over, inside a dialog. The language can be
// changed here: it is locked in a game once a player has joined.
export default function NewGamePanel({ language: initialLanguage, cancelLabel, onCancel, onConfirm }: Props) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState(initialLanguage);
  return (
    <>
      <AppText variant="display">{t('newGame.title')}</AppText>
      <AppText style={styles.text}>{t('newGame.text')}</AppText>
      <OptionPicker
        label={t('settings.language')}
        options={LANGUAGES}
        value={language}
        onChange={setLanguage}
        format={languageLabel}
      />
      <View style={styles.actions}>
        <FocusableButton label={cancelLabel} variant="secondary" onPress={onCancel} hasTVPreferredFocus />
        <FocusableButton label={t('common.newGame')} icon="refresh" onPress={() => onConfirm(language)} sound="start" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.highlight,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
});
