import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialName = ComponentProps<typeof MaterialIcons>['name'];

type IconMapping = Record<string, MaterialName>;

/**
 * SF Symbol names mapped to Material Icons for Android and web.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'play.circle.fill': 'play-circle-filled',
  'archivebox.fill': 'archive',
  'person.3.fill': 'groups',
  'person.crop.circle.fill': 'account-circle',
  magnifyingglass: 'search',
  'line.3.horizontal': 'menu',
  'icloud.and.arrow.up': 'cloud-upload',
  'map.fill': 'map',
  'mountain.2.fill': 'terrain',
  'bubble.left.and.bubble.right.fill': 'forum',
  'heart.fill': 'favorite-border',
  'square.and.arrow.up': 'share',
  'doc.fill': 'picture-as-pdf',
  'arrow.clockwise': 'sync',
  'checkmark.shield.fill': 'check-circle',
  'calendar.badge.plus': 'event',
  'checkmark.circle.fill': 'check-circle',
  'dot.radiowaves.left.and.right': 'podcasts',
  'play.rectangle.fill': 'play-circle-filled',
  'play.fill': 'play-arrow',
  'chevron.left': 'chevron-left',
  'briefcase.fill': 'work',
  'graduationcap.fill': 'school',
  'sun.max.fill': 'wb-sunny',
  'figure.stand': 'accessibility',
  'bell.fill': 'notifications',
  'bell.slash.fill': 'notifications-off',
  'person.fill.checkmark': 'how-to-reg',
  'paperplane.circle.fill': 'send',
  'plus.circle.fill': 'add-circle',
  'arrow.right': 'arrow-forward',
  'mappin.and.ellipse': 'place',
  link: 'link',
  'video.fill': 'videocam',
  xmark: 'close',
  'arrow.2.squarepath': 'compare-arrows',
} as const satisfies IconMapping;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * Native SF Symbols on iOS; Material Icons on Android and web (see MAPPING).
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
