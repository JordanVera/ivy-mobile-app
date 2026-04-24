import { Image } from 'expo-image';
import { View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';

import { IvyText } from './ivy-text';

export type EpisodeCommentRowProps = {
  name: string;
  time: string;
  body: string;
  authorImageUrl?: string | null;
  /** Slight visual treatment for your own comments or in-flight optimistic ones. */
  variant?: 'default' | 'mine' | 'pending';
};

export function EpisodeCommentRow({
  name,
  time,
  body,
  authorImageUrl,
  variant = 'default',
}: EpisodeCommentRowProps) {
  const isPending = variant === 'pending';

  return (
    <View
      className={`flex-row gap-3 py-3 ${isPending ? 'opacity-60' : ''}`}
      accessibilityLabel={`Comment by ${name}`}
    >
      <View className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-ivy-accent/15 dark:bg-ivy-accent/25">
        {authorImageUrl ? (
          <Image
            source={{ uri: authorImageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            accessible={false}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <IconSymbol
              name="person.crop.circle.fill"
              size={28}
              color={IvyColors.accent}
            />
          </View>
        )}
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row items-baseline gap-2">
          <IvyText
            className="shrink-0 text-sm font-semibold text-zinc-900 dark:text-white"
            numberOfLines={1}
          >
            {name}
          </IvyText>
          <IvyText className="text-xs text-zinc-400 dark:text-zinc-500">
            {isPending ? 'Posting…' : time}
          </IvyText>
        </View>
        <IvyText className="mt-0.5 text-[15px] leading-6 text-zinc-700 dark:text-zinc-300">
          {body}
        </IvyText>
      </View>
    </View>
  );
}
