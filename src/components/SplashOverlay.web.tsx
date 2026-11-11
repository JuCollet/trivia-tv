import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as SplashScreen from 'expo-splash-screen';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import AppText from './AppText';
import { resumeMusic } from '@/audio/sounds';
import { useRemoteEvents } from '@/hooks/useRemoteEvents';
import { s, spacing } from '@/theme';

const VIDEO = require('../../assets/splash/video.mp4');
// Still version of the video, shown until its first frame renders.
const BACKGROUND = require('../../assets/splash/background.jpg');
const LOGO = require('../../assets/splash/logo.png');
const FADE_MS = 500;
const LOGO_RATIO = 1672 / 941;
const LOGO_WIDTH = 0.42;

// In a browser, the intro waits for a click: a page may only play sound after
// one, so the lobby music starts with it. The video plays muted (allowed by
// autoplay rules) and loops behind the prompt until the click.
export default function SplashOverlay({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const [opacity] = useState(() => new Animated.Value(1));
  const leaving = useRef(false);
  const player = useVideoPlayer(VIDEO, (p) => {
    p.muted = true;
    p.loop = true;
    p.play();
  });
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  // On the web the first play() can land before the media element exists and
  // is dropped: start again once the video is ready (muted autoplay is allowed).
  useEffect(() => {
    if (status === 'readyToPlay') player.play();
  }, [status, player]);
  const { width: screenWidth } = useWindowDimensions();
  const logoWidth = Math.round(screenWidth * LOGO_WIDTH);

  const leave = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    resumeMusic();
    Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: false }).start(() => {
      player.pause();
      onDone();
    });
  }, [opacity, player, onDone]);

  useRemoteEvents((event) => {
    if (event.eventType === 'select') leave();
  });

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
      <Pressable style={styles.container} onPress={leave}>
        <Image source={BACKGROUND} style={styles.fill} resizeMode="cover" />
        <VideoView player={player} style={styles.fill} contentFit="cover" nativeControls={false} />
        <Image
          source={LOGO}
          style={{ width: logoWidth, height: Math.round(logoWidth / LOGO_RATIO) }}
          resizeMode="contain"
        />
        <View style={styles.prompt}>
          <AppText variant="title">{t('web.start')}</AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    backgroundColor: '#0B1260',
    cursor: 'pointer',
  },
  fill: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  prompt: {
    paddingHorizontal: s(24),
    paddingVertical: s(10),
    borderRadius: s(999),
    backgroundColor: 'rgba(3, 6, 40, 0.6)',
  },
});
