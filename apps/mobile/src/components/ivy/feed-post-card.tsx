import { Pressable, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

import { IvyText } from './ivy-text';

type FeedPostCardProps = {
  name: string;
  time: string;
  body: string;
};

export function FeedPostCard({ name, time, body }: FeedPostCardProps) {
  return (
    <View className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <View className="mb-3 flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
          <IconSymbol name="person.crop.circle.fill" size={32} color="#b45309" />
        </View>
        <View className="flex-1">
          <IvyText className="text-base font-semibold text-zinc-900 dark:text-white">{name}</IvyText>
          <IvyText className="text-xs text-zinc-500 dark:text-zinc-400">{time}</IvyText>
        </View>
      </View>
      <IvyText className="text-[15px] leading-6 text-zinc-700 dark:text-zinc-300">{body}</IvyText>
      <View className="mt-4 flex-row gap-6 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <Pressable className="flex-row items-center gap-1.5">
          <IconSymbol name="heart.fill" size={22} color="#a1a1aa" />
          <IvyText className="text-sm text-zinc-500 dark:text-zinc-400">Like</IvyText>
        </Pressable>
        <Pressable className="flex-row items-center gap-1.5">
          <IconSymbol name="bubble.left.and.bubble.right.fill" size={22} color="#a1a1aa" />
          <IvyText className="text-sm text-zinc-500 dark:text-zinc-400">Comment</IvyText>
        </Pressable>
        <Pressable className="flex-row items-center gap-1.5">
          <IconSymbol name="square.and.arrow.up" size={22} color="#a1a1aa" />
          <IvyText className="text-sm text-zinc-500 dark:text-zinc-400">Share</IvyText>
        </Pressable>
      </View>
    </View>
  );
}
