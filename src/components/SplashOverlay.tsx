import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, useWindowDimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRemoteEvents } from '@/hooks/useRemoteEvents';

// Keeps the native splash visible until the still background is on screen.
SplashScreen.preventAutoHideAsync();

const VIDEO = require('../../assets/splash/video.mp4');
// Still version of the video, shown until its first frame renders.
const BACKGROUND = require('../../assets/splash/background.jpg');
const LOGO = require('../../assets/splash/logo.png');
// Only the start of the 10 s animation is shown.
const PLAY_MS = 7000;
const FADE_MS = 500;
const LOGO_POP_MS = 900;
const LOGO_RATIO = 1672 / 941;
// Share of the screen width at the start; grown by up to 1.12, it stays under half.
const LOGO_WIDTH = 0.42;
// Gives up on the video if it never shows a frame (decoding error, slow device).
const FIRST_FRAME_TIMEOUT_MS = 3000;

export default function SplashOverlay({ onDone }: { onDone: () => void }) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [logoScale] = useState(() => new Animated.Value(0.4));
  const [logoOpacity] = useState(() => new Animated.Value(0));
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const leaving = useRef(false);
  const { width: screenWidth } = useWindowDimensions();
  const logoWidth = Math.round(screenWidth * LOGO_WIDTH);

  const player = useVideoPlayer(VIDEO, (p) => {
    // The lobby music already plays underneath.
    p.muted = true;
    p.play();
  });
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  const leave = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    SplashScreen.hide();
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start(() => {
      player.pause();
      onDone();
    });
  }, [opacity, player, onDone]);

  // OK on the remote skips the intro.
  useRemoteEvents((event) => {
    if (started && event.eventType === 'select') leave();
  });

  useEffect(() => {
    if (status === 'error') leave();
  }, [status, leave]);

  useEffect(() => {
    if (backgroundLoaded) SplashScreen.hide();
  }, [backgroundLoaded]);

  // The logo pops in with the video, then keeps growing slowly until the fade.
  useEffect(() => {
    if (!started) return;
    const animation = Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: LOGO_POP_MS / 2, useNativeDriver: true }),
      Animated.sequence([
        Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
        Animated.timing(logoScale, {
          toValue: 1.12,
          duration: PLAY_MS + FADE_MS - LOGO_POP_MS,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ]);
    animation.start();
    return () => animation.stop();
  }, [started, logoOpacity, logoScale]);

  useEffect(() => {
    if (started) {
      SplashScreen.hide();
      const timer = setTimeout(leave, PLAY_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(leave, FIRST_FRAME_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [started, leave]);

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container, { opacity }]}>
      <Image
        source={BACKGROUND}
        style={styles.fill}
        resizeMode="cover"
        onLoadEnd={() => setBackgroundLoaded(true)}
        fadeDuration={0}
      />
      <VideoView
        player={player}
        style={styles.fill}
        contentFit="cover"
        nativeControls={false}
        // A SurfaceView ignores the opacity of its parent on Android: the fade needs a TextureView.
        surfaceType="textureView"
        onFirstFrameRender={() => setStarted(true)}
      />
      <Animated.Image
        source={LOGO}
        style={{
          width: logoWidth,
          height: Math.round(logoWidth / LOGO_RATIO),
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }}
        resizeMode="contain"
        fadeDuration={0}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B1260',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Explicit size: with absoluteFill alone, media renders at its intrinsic size on Android TV.
  fill: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
});
