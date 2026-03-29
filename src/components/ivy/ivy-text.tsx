import { Text, type TextProps } from 'react-native';

import { FontFamily } from '@/constants/fonts';

export function IvyText({ style, ...props }: TextProps) {
  return <Text style={[{ fontFamily: FontFamily.sans }, style]} {...props} />;
}
