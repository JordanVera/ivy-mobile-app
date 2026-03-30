import { Text, type TextProps } from 'react-native';

import { FontFamily } from '@/constants/fonts';

type IvyHeadingProps = TextProps & { level?: 'brand' | 'title' | 'section' };

export function IvyHeading({ style, level = 'title', ...props }: IvyHeadingProps) {
  const fontFamily =
    level === 'brand' ? FontFamily.serifBold : FontFamily.serifSemiBold;
  return <Text style={[{ fontFamily }, style]} {...props} />;
}
