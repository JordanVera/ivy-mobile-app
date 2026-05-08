import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, type PressableProps } from 'react-native';

import { IvyColors } from '@/constants/ivy-colors';

type AccentGradientButtonProps = PressableProps & {
  title: string;
};

export function AccentGradientButton({ title, disabled, ...pressableProps }: AccentGradientButtonProps) {
  return (
    <Pressable disabled={disabled} {...pressableProps} className="rounded-xl opacity-100 active:opacity-90">
      <LinearGradient
        colors={[...IvyColors.accentGradient]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 12,
          alignItems: 'center',
        }}>
        <Text className="text-base font-semibold text-zinc-900">{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}
