import { memo, useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import createQr from 'qrcode-generator';
import { radius } from '@/theme';

type Props = {
  value: string;
  // Upper bound of the side, in pixels. The code is drawn with whole-pixel
  // modules so it stays sharp, which can make it slightly smaller.
  size: number;
  style?: ViewStyle;
};

// White border around the code, in modules. Scanners need a light quiet zone
// to find the code; the light frame around the box adds to it.
const QUIET_ZONE = 3;

// Black on white QR code, drawn with plain views so it renders the same on
// Android TV, tvOS and the web without any native module.
function QrCode({ value, size, style }: Props) {
  const { count, runs } = useMemo(() => encode(value), [value]);
  const cell = Math.max(1, Math.floor(size / (count + QUIET_ZONE * 2)));
  const side = cell * (count + QUIET_ZONE * 2);

  return (
    <View style={[styles.box, { width: side, height: side }, style]}>
      <View style={{ width: cell * count, height: cell * count }}>
        {runs.map(([row, col, length]) => (
          <View
            key={`${row}-${col}`}
            style={[styles.dark, { top: row * cell, left: col * cell, width: length * cell, height: cell }]}
          />
        ))}
      </View>
    </View>
  );
}

export default memo(QrCode);

// Encodes the value and merges the dark modules of each row into horizontal
// runs [row, col, length], to draw a few hundred views instead of a thousand.
function encode(value: string) {
  // Medium error correction: survives a blurry projector without growing the
  // code too much for a short URL.
  const qr = createQr(0, 'M');
  qr.addData(value);
  qr.make();
  const count = qr.getModuleCount();
  const runs: [number, number, number][] = [];
  for (let row = 0; row < count; row++) {
    let col = 0;
    while (col < count) {
      if (!qr.isDark(row, col)) {
        col++;
        continue;
      }
      const start = col;
      while (col < count && qr.isDark(row, col)) col++;
      runs.push([row, start, col - start]);
    }
  }
  return { count, runs };
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dark: {
    position: 'absolute',
    backgroundColor: '#000000',
  },
});
