import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_SETTINGS } from '@/game/rules';
import type { Language } from '@/game/types';
import en from './en';
import fr from './fr';

const i18n = createInstance();

// The interface speaks the game's language: changing it in the settings
// switches every screen at once.
void i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en } },
  lng: DEFAULT_SETTINGS.language,
  fallbackLng: 'fr',
  // React already escapes text.
  interpolation: { escapeValue: false },
  // Resources are bundled: init is synchronous and the first render is translated.
  initAsync: false,
});

export function setLanguage(language: Language) {
  if (i18n.language !== language) void i18n.changeLanguage(language);
}

export default i18n;
