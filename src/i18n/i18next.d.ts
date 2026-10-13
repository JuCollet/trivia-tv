import 'i18next';
import type fr from './fr';

// Type-checks translation keys against the French copy.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof fr };
  }
}
