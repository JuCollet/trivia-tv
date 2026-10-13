import { Dimensions, Platform } from 'react-native';

// Sizes are designed for a 960×540 TV canvas (Android TV's logical resolution at 1080p).
// On TV they scale with the actual width: ×1 on Android TV, ×2 on Apple TV (1920 points).
const TV_CANVAS_WIDTH = 960;
const scale = Platform.isTV ? Dimensions.get('window').width / TV_CANVAS_WIDTH : 1;
export const s = (value: number) => Math.round(value * scale);

export const colors = {
  background: '#0B1260',
  surface: '#18217A',
  surfaceRaised: '#232D93',
  text: '#FFFFFF',
  textMuted: '#AEB6F0',
  accent: '#FFC93C',
  focus: '#FFFFFF',
  success: '#2ECC71',
  danger: '#FF5A5F',
  answers: ['#E74C3C', '#3498DB', '#F1C40F', '#2ECC71'] as const,
  // Translucent panels laid over the background image.
  panel: 'rgba(8, 18, 110, 0.6)',
  panelBorder: 'rgba(90, 140, 255, 0.55)',
  highlight: '#7CC6FF',
  launch: '#F0203F',
  launchEdge: '#A80F2A',
  ready: '#2EE58A',
  // Dark text on the bright pills and badges.
  onBright: '#0B1260',
  // Avatar colors, given out in joining order.
  players: [
    '#FFC93C',
    '#FF4FCF',
    '#1FD3F0',
    '#FF8A1F',
    '#8B5CF6',
    '#2EE58A',
    '#FF5A5F',
    '#3B82F6',
    '#F472B6',
    '#A3E635',
  ] as const,
} as const;

export const spacing = {
  xs: s(4),
  sm: s(8),
  md: s(12),
  lg: s(20),
  xl: s(32),
} as const;

// TV safe area: some TVs crop the edges of the picture (overscan).
export const safeArea = {
  horizontal: s(48),
  vertical: s(27),
} as const;

export const radius = {
  sm: s(6),
  md: s(12),
  lg: s(20),
} as const;

// Fonts are embedded at build time by the expo-font config plugin (app.json).
// Android resolves them by file name, iOS/tvOS by PostScript name.
// Weights are separate families: pick the weight via fontFamily, never fontWeight.
const font = (android: string, ios: string) => Platform.select({ ios, default: android });

export const fonts = {
  display: font('LilitaOne_400Regular', 'LilitaOne'),
  body: font('Fredoka_400Regular', 'Fredoka-Regular'),
  bodyMedium: font('Fredoka_500Medium', 'Fredoka-Medium'),
  bodySemiBold: font('Fredoka_600SemiBold', 'Fredoka-SemiBold'),
  bodyBold: font('Fredoka_700Bold', 'Fredoka-Bold'),
} as const;

export const fontSize = {
  caption: s(12),
  body: s(16),
  title: s(20),
  display: s(32),
  hero: s(48),
} as const;

export const answerLetters = ['A', 'B', 'C', 'D'] as const;
