import type { ImageSourcePropType } from 'react-native';
import type { AwardId } from './types';

// One trophy picture per award. Static requires, so that Metro bundles each image.
export const AWARD_IMAGES: Record<AwardId, ImageSourcePropType> = {
  plusViteQueSonOmbre: require('../../assets/images/awards/plusViteQueSonOmbre.png'),
  outsider: require('../../assets/images/awards/outsider.png'),
  seulContreTous: require('../../assets/images/awards/seulContreTous.png'),
  pasMonTruc: require('../../assets/images/awards/pasMonTruc.png'),
  bonnetDane: require('../../assets/images/awards/bonnetDane.png'),
};

// In the order the end-of-round screen shows them.
export const AWARD_ORDER: AwardId[] = ['plusViteQueSonOmbre', 'outsider', 'seulContreTous', 'pasMonTruc', 'bonnetDane'];
