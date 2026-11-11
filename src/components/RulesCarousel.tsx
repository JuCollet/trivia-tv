import { useState, type ComponentProps } from 'react';
import { Image, Modal, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';
import FocusableButton from './FocusableButton';
import { playSfx } from '@/audio/sounds';
import type { AwardId } from '@/game/types';
import { useRemoteEvents } from '@/hooks/useRemoteEvents';
import { colors, fonts, radius, s, spacing } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type RuleKey = 'concept' | 'answers' | 'master' | 'final' | 'trophies';

const RULES: { key: RuleKey; icon: IconName }[] = [
  { key: 'concept', icon: 'bulb' },
  { key: 'answers', icon: 'flash' },
  { key: 'master', icon: 'ribbon' },
  { key: 'final', icon: 'help-circle' },
  { key: 'trophies', icon: 'trophy' },
];

// In the order the end-of-round screen shows them. The good theme bonus is
// no longer part of the rules, so it is not presented.
const TROPHIES: { id: AwardId; image: number }[] = [
  { id: 'plusViteQueSonOmbre', image: require('../../assets/images/awards/plusViteQueSonOmbre.png') },
  { id: 'outsider', image: require('../../assets/images/awards/outsider.png') },
  { id: 'seulContreTous', image: require('../../assets/images/awards/seulContreTous.png') },
  { id: 'pasMonTruc', image: require('../../assets/images/awards/pasMonTruc.png') },
  { id: 'bonnetDane', image: require('../../assets/images/awards/bonnetDane.png') },
];

type Page = ({ kind: 'rule' } & (typeof RULES)[number]) | ({ kind: 'trophy' } & (typeof TROPHIES)[number]);

const PAGES: Page[] = [
  ...RULES.map((rule) => ({ kind: 'rule' as const, ...rule })),
  ...TROPHIES.map((trophy) => ({ kind: 'trophy' as const, ...trophy })),
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

// The rules, then the trophies, one page at a time. Left and right on the
// remote browse the pages, back closes the carousel.
export default function RulesCarousel({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Mounted only while open, so the remote's arrows are only caught then. */}
      {visible ? <Carousel onClose={onClose} /> : null}
    </Modal>
  );
}

function Carousel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const page = PAGES[index];
  const isLast = index === PAGES.length - 1;

  // The Next button plays the page-turn sound itself, so it must not be played twice.
  const go = (step: number, withSound = true) => {
    const next = index + step;
    if (next < 0 || next >= PAGES.length) return;
    if (withSound) void playSfx('option');
    setIndex(next);
  };

  // The button is the only focusable element, so the arrows never move focus.
  useRemoteEvents((event) => {
    // Android TV sends key down (0) then key up (1): act on the press only.
    if (event.eventKeyAction === 1) return;
    if (event.eventType === 'left') go(-1);
    if (event.eventType === 'right') go(1);
  });

  return (
    <View style={styles.backdrop}>
      <View style={styles.dialog}>
        <View style={styles.header}>
          <AppText variant="title" style={styles.heading}>
            {t('rules.title')}
          </AppText>
          <AppText style={styles.pageNumber}>{t('rules.page', { number: index + 1, total: PAGES.length })}</AppText>
        </View>

        <View style={styles.body}>
          <Ionicons
            name="chevron-back"
            size={s(32)}
            color={index > 0 ? colors.highlight : 'transparent'}
          />
          <View key={index} style={styles.page}>
            {page.kind === 'rule' ? (
              <>
                <View style={styles.iconCircle}>
                  <Ionicons name={page.icon} size={s(52)} color={colors.accent} />
                </View>
                <AppText variant="display" style={styles.center}>
                  {t(`rules.${page.key}.title`)}
                </AppText>
                <AppText style={[styles.center, styles.text]}>{t(`rules.${page.key}.text`)}</AppText>
              </>
            ) : (
              <>
                <Image source={page.image} style={styles.trophy} resizeMode="contain" />
                <AppText style={styles.kicker}>{t('rules.trophy')}</AppText>
                <AppText variant="display" style={styles.center}>
                  {t(`awards.${page.id}.label`)}
                </AppText>
                <AppText style={[styles.center, styles.text]}>{t(`awards.${page.id}.description`)}</AppText>
              </>
            )}
          </View>
          <Ionicons name="chevron-forward" size={s(32)} color={isLast ? 'transparent' : colors.highlight} />
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {PAGES.map((p, i) => (
              <View
                key={p.kind === 'rule' ? p.key : p.id}
                style={[styles.dot, p.kind === 'trophy' && styles.trophyDot, i === index && styles.dotActive]}
              />
            ))}
          </View>
          <FocusableButton
            label={isLast ? t('rules.close') : t('rules.next')}
            icon={isLast ? undefined : 'arrow-forward'}
            sound={isLast ? 'click' : 'option'}
            onPress={isLast ? onClose : () => go(1, false)}
            hasTVPreferredFocus
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3, 6, 40, 0.85)',
  },
  dialog: {
    width: s(720),
    height: s(470),
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    color: colors.highlight,
  },
  pageNumber: {
    fontFamily: fonts.bodySemiBold,
    color: colors.highlight,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: s(96),
    height: s(96),
    borderRadius: s(48),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: s(1.5),
    borderColor: colors.panelBorder,
  },
  trophy: {
    width: s(130),
    height: s(130),
  },
  kicker: {
    fontFamily: fonts.bodyBold,
    fontSize: s(13),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.accent,
  },
  center: {
    textAlign: 'center',
  },
  text: {
    fontSize: s(18),
    lineHeight: s(26),
    color: colors.highlight,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: s(10),
    height: s(10),
    borderRadius: s(5),
    backgroundColor: colors.surfaceRaised,
  },
  trophyDot: {
    borderRadius: s(2),
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
});
