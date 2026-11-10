import { useCallback, useEffect, useRef, useState } from 'react';
import { useEventListener } from 'expo';
import { Image, StyleSheet, View, type DimensionValue, type ImageSourcePropType } from 'react-native';
import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';

// Delays in ms as [min, max]: each wait is picked at random in the range, so
// several animated avatars on screen don't move in sync.
export type Delays = { first: [number, number]; pause: [number, number] };

// Lobby seats: first play soon after joining, then a long rest between two plays.
export const IDLE_DELAYS: Delays = { first: [2000, 10000], pause: [8000, 15000] };

type Props = {
  still?: ImageSourcePropType;
  video?: VideoSource;
  delays?: Delays;
  // Share of the parent circle the avatar fills.
  size?: DimensionValue;
};

// An avatar inside its round seat: the animated variant when there is one,
// otherwise the still image. Fills 92% of the parent circle by default, which clips it.
export default function AvatarMedia({ still, video, delays = IDLE_DELAYS, size = '92%' }: Props) {
  const box = { width: size, height: size };
  if (video) return <AvatarVideo source={video} still={still} delays={delays} box={box} />;
  if (!still) return null;
  return <Image source={still} style={box} resizeMode="contain" fadeDuration={0} />;
}

function randomBetween([min, max]: [number, number]) {
  return min + Math.random() * (max - min);
}

// The clip is played once, then held on its last frame (the same as the first:
// the clips loop seamlessly) for a random pause before it plays again. A constant
// loop would make the screen too busy. The still image stays underneath until
// the first frame renders, so the seat never flashes black.
function AvatarVideo({
  source,
  still,
  delays,
  box,
}: {
  source: VideoSource;
  still?: ImageSourcePropType;
  delays: Delays;
  box: { width: DimensionValue; height: DimensionValue };
}) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.muted = true;
  });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const schedule = useCallback(
    (delay: number) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => player.replay(), delay);
    },
    [player],
  );

  useEffect(() => {
    schedule(randomBetween(delays.first));
    return () => clearTimeout(timer.current);
  }, [schedule, delays.first]);

  useEventListener(player, 'playToEnd', () => schedule(randomBetween(delays.pause)));

  const [started, setStarted] = useState(false);
  return (
    <View style={box}>
      {still ? <Image source={still} style={styles.fill} resizeMode="contain" fadeDuration={0} /> : null}
      <VideoView
        player={player}
        style={[styles.fill, !started && styles.hidden]}
        contentFit="contain"
        nativeControls={false}
        allowsPictureInPicture={false}
        fullscreenOptions={{ enable: false }}
        // A SurfaceView ignores the round clip of the seat on Android: its square corners would cover the ring.
        surfaceType="textureView"
        onFirstFrameRender={() => setStarted(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Explicit size: with absoluteFill alone, media renders at its intrinsic size on Android TV.
  fill: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  hidden: {
    opacity: 0,
  },
});
