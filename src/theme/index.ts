import { Dimensions, Platform } from 'react-native';

// Sizes are designed for a 960×540 TV canvas (Android TV's logical resolution at 1080p).
// On TV they scale with the actual width: ×1 on Android TV, ×2 on Apple TV (1920 points).
// In a browser, with the window, so that the whole 16:9 canvas fits in it.
const TV_CANVAS_WIDTH = 960;
const TV_CANVAS_HEIGHT = 540;
const window = Dimensions.get('window');
const scale = Platform.isTV
  ? window.width / TV_CANVAS_WIDTH
  : Platform.OS === 'web'
    ? Math.min(window.width / TV_CANVAS_WIDTH, window.height / TV_CANVAS_HEIGHT)
    : 1;
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
  ready: '#2EE58A',
  // Lobby seats: the avatar always sits on dark navy.
  seat: '#070C4A',
  seatHint: 'rgba(7, 12, 74, 0.7)',
  freeSeat: 'rgba(124, 198, 255, 0.35)',
  freeSeatFill: 'rgba(7, 12, 74, 0.4)',
  // Focus ring around a white or green button, and its disabled look.
  focusRing: 'rgba(255, 255, 255, 0.35)',
  disabledFill: 'rgba(255, 255, 255, 0.12)',
  disabledBorder: 'rgba(255, 255, 255, 0.18)',
  disabledText: 'rgba(255, 255, 255, 0.4)',
  // Lobby sidebar: a rounded card over the background, its info chips and
  // the Rules / Settings footer.
  card: 'rgba(7, 12, 74, 0.72)',
  cardBorder: 'rgba(90, 140, 255, 0.35)',
  chip: 'rgba(24, 33, 122, 0.9)',
  chipAccent: 'rgba(255, 201, 60, 0.15)',
  cardFooter: 'rgba(35, 45, 147, 0.55)',
  cardFooterFocused: '#3A47C4',
  // Dark text on the bright pills and badges.
  onBright: '#0B1260',
  // Slot machine of the final question's announcement.
  slotFrame: '#3A1A6E',
  slotWindow: '#FFF8E6',
  slotText: '#2A1458',
  slotPointer: '#FF4FCF',
  bulbOff: '#5A4A10',
  // A negative score in the podium's ranking.
  scoreNegative: '#FF8A8E',
} as const;

// Button faces, top to bottom: light at the top, the base color at 45%,
// darker at the bottom, so the face looks domed (FocusableButton).
// Kept sober: a slightly rounded matte surface, not glossy plastic.
// The matte ones only shade slightly, without any shine.
export const gradients = {
  go: ['#49E899', '#2EE58A', '#29CE7C'],
  round: ['#FFFFFF', '#F3F5FF', '#DADEF0'],
  primary: ['#FFD055', '#FFC93C', '#E6B536'],
  secondary: ['#3D46A0', '#232D93', '#1F2884'],
  outline: ['rgba(37, 46, 135, 0.6)', 'rgba(8, 18, 110, 0.6)', 'rgba(7, 16, 99, 0.6)'],
  // Podium screen: the backdrop, dark at the top and lighter at the bottom.
  podiumBackdrop: ['#050838', '#0A1062', '#1A2696'],
} as const;

// Podium steps by rank (gold, silver, bronze): a flat matte face shaded like the
// buttons, and the darker ink of the rank and score written on it.
export const podiumSteps = [
  { face: ['#FFE07A', '#FFC93C', '#E9AE22'], ink: '#8C5E05' },
  { face: ['#EEF1FB', '#CDD4EC', '#AEB8DA'], ink: '#4E5A86' },
  { face: ['#F6BE8E', '#E8975A', '#CF7C41'], ink: '#7A3D16' },
] as const;

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
