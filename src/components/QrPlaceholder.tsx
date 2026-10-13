import { StyleSheet, View, type ViewStyle } from 'react-native';
import AppText from './AppText';
import { radius, s } from '@/theme';

type Props = {
  value: string;
  size?: number;
  style?: ViewStyle;
};

// TODO: replace with a real QR code (e.g. react-native-qrcode-svg) encoding the room URL.
export default function QrPlaceholder({ value, size = s(180), style }: Props) {
  return (
    <View style={[styles.box, { width: size, height: size }, style]}>
      <AppText style={styles.text} numberOfLines={3}>
        QR
        {'\n'}
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#000000',
    textAlign: 'center',
  },
});
