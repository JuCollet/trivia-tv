import { useFonts } from 'expo-font';
import { Fredoka_400Regular } from '@expo-google-fonts/fredoka/400Regular';
import { Fredoka_500Medium } from '@expo-google-fonts/fredoka/500Medium';
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka/600SemiBold';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka/700Bold';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one/400Regular';

// The config plugin only embeds fonts in native builds: a browser loads them here,
// under the same family names as Android (theme/index.ts).
export function useWebFonts() {
  useFonts({ LilitaOne_400Regular, Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold });
}
