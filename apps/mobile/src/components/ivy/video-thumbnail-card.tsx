import { View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

import { IvyText } from './ivy-text';

type VideoThumbnailCardProps = {
  title: string;
  duration: string;
  live?: boolean;
};

export function VideoThumbnailCard({ title, duration, live }: VideoThumbnailCardProps) {
  return (
    <View className="mb-3 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
      <View className="aspect-video w-full items-center justify-center bg-zinc-200 dark:bg-zinc-950">
        <IconSymbol name="play.circle.fill" size={40} color="#b45309" />
        {live ? (
          <View className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5">
            <IvyText className="text-xs font-bold text-white">LIVE</IvyText>
          </View>
        ) : null}
      </View>
      <View className="p-2">
        <IvyText className="text-sm font-semibold text-zinc-900 dark:text-white" numberOfLines={2}>
          {title}
        </IvyText>
        <IvyText className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{duration}</IvyText>
      </View>
    </View>
  );
}
