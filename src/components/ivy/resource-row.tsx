import { Pressable, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

import { IvyText } from './ivy-text';

type ResourceRowProps = {
  title: string;
  onPress?: () => void;
};

export function ResourceRow({ title, onPress }: ResourceRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-2 flex-row items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 active:opacity-80">
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
        <IconSymbol name="archivebox.fill" size={26} color="#b45309" />
      </View>
      <IvyText className="flex-1 text-base font-medium text-zinc-900 dark:text-white">{title}</IvyText>
      <IconSymbol name="chevron.right" size={22} color="#a1a1aa" />
    </Pressable>
  );
}
