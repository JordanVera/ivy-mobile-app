import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, type PressableProps } from 'react-native';

type GoldGradientButtonProps = PressableProps & {
  title: string;
};

export function GoldGradientButton({ title, disabled, ...pressableProps }: GoldGradientButtonProps) {
  return (
    <Pressable disabled={disabled} {...pressableProps} className="rounded-xl opacity-100 active:opacity-90">
      <LinearGradient
        colors={['#b45309', '#f59e0b', '#b45309']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 12,
          alignItems: 'center',
        }}>
        <Text className="text-base font-semibold text-white">{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}
