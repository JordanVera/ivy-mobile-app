import { View } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';

import { IvyText } from './ivy-text';

type CommunityPillarCardProps = {
  title: string;
  subtitle: string;
  icon: IconSymbolName;
};

export function CommunityPillarCard({ title, subtitle, icon }: CommunityPillarCardProps) {
  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 p-4 dark:border-zinc-700 dark:bg-zinc-950">
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
        <IconSymbol name={icon} size={28} color="#fbbf24" />
      </View>
      <IvyText className="text-lg font-semibold text-white">{title}</IvyText>
      <IvyText className="mt-1 text-sm text-zinc-400">{subtitle}</IvyText>
    </View>
  );
}
