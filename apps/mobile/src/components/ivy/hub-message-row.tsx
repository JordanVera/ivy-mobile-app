import { Image } from 'expo-image';
import { View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';

import { IvyText } from './ivy-text';

export type HubMessageRowProps = {
  name: string;
  time: string;
  body: string;
  authorImageUrl?: string | null;
  /** Right-aligned accent bubble for own messages; left-aligned for others. */
  variant?: 'default' | 'mine' | 'pending';
  /** When true, suppress the avatar/name header (consecutive messages from same author). */
  compact?: boolean;
};

export function HubMessageRow({
  name,
  time,
  body,
  authorImageUrl,
  variant = 'default',
  compact = false,
}: HubMessageRowProps) {
  const isMine = variant === 'mine' || variant === 'pending';
  const isPending = variant === 'pending';

  return (
    <View
      className={`flex-row gap-2 ${compact ? 'mt-1' : 'mt-3'} ${
        isMine ? 'justify-end' : 'justify-start'
      } ${isPending ? 'opacity-70' : ''}`}
      accessibilityLabel={`Message from ${name}`}
    >
      {!isMine ? (
        <View className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-ivy-accent/15 dark:bg-ivy-accent/25">
          {compact ? null : authorImageUrl ? (
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
                size={26}
                color={IvyColors.accent}
              />
            </View>
          )}
        </View>
      ) : null}

      <View className={`max-w-[78%] ${isMine ? 'items-end' : 'items-start'}`}>
        {!compact ? (
          <View
            className={`mb-1 flex-row items-baseline gap-2 ${
              isMine ? 'justify-end' : 'justify-start'
            }`}
          >
            <IvyText
              className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300"
              numberOfLines={1}
            >
              {isMine ? 'You' : name}
            </IvyText>
            <IvyText className="text-[11px] text-zinc-400 dark:text-zinc-500">
              {isPending ? 'Sending…' : time}
            </IvyText>
          </View>
        ) : null}

        <View
          className={`rounded-2xl px-3.5 py-2.5 ${
            isMine
              ? 'rounded-br-md bg-ivy-accent'
              : 'rounded-bl-md bg-zinc-100 dark:bg-zinc-800'
          }`}
        >
          <IvyText
            className={`text-[15px] leading-5 ${
              isMine ? 'text-zinc-900' : 'text-zinc-800 dark:text-zinc-100'
            }`}
          >
            {body}
          </IvyText>
        </View>
      </View>
    </View>
  );
}
