import { useEffect, useState } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Keeps the native splash visible until the full-screen image is ready.
SplashScreen.preventAutoHideAsync();

const HOLD_MS = 5000;
const FADE_MS = 500;

export default function SplashOverlay({ onDone }: { onDone: () => void }) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    SplashScreen.hide();
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(() => onDone());
    }, HOLD_MS);
    return () => clearTimeout(timer);
  }, [loaded, opacity, onDone]);

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container, { opacity }]}>
      <Image
        source={require('../../assets/images/splash.jpg')}
        style={styles.image}
        resizeMode="cover"
        onLoadEnd={() => setLoaded(true)}
        fadeDuration={0}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B1260',
  },
  // Explicit size: with absoluteFill alone, the image renders at its intrinsic size on Android TV.
  image: {
    width: '100%',
    height: '100%',
  },
});
