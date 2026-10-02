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

export const fontSize = {
  caption: s(12),
  body: s(16),
  title: s(20),
  display: s(32),
  hero: s(48),
} as const;

export const answerLetters = ['A', 'B', 'C', 'D'] as const;
