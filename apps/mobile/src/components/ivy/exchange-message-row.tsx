import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';

import { IvyText } from './ivy-text';

const ACCENT = IvyColors.accent;

export type ExchangeMessageRowProps = {
  id: string;
  name: string;
  time: string;
  body: string;
  authorImageUrl?: string | null;
  variant?: 'default' | 'mine' | 'pending';
  compact?: boolean;
  likeCount: number;
  likedByMe: boolean;
  editedAt?: string | null;
  replyTo?: { id: string; name: string; body: string } | null;
  /** Whether this message's action bar is currently visible. */
  isActive?: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onLike: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function ExchangeMessageRow({
  name,
  time,
  body,
  authorImageUrl,
  variant = 'default',
  compact = false,
  likeCount,
  likedByMe,
  editedAt,
  replyTo,
  isActive = false,
  onActivate,
  onDeactivate,
  onLike,
  onReply,
  onEdit,
  onDelete,
}: ExchangeMessageRowProps) {
  const isMine = variant === 'mine' || variant === 'pending';
  const isPending = variant === 'pending';

  // A reply always breaks grouping visually
  const isGrouped = compact && !replyTo;

  const avatarSlot = (imageUrl?: string | null) =>
    imageUrl ? (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        accessible={false}
      />
    ) : (
      <View className="flex-1 items-center justify-center">
        <IconSymbol
          name="person.crop.circle.fill"
          size={26}
          color={ACCENT}
        />
      </View>
    );

  return (
    <View className={`${isGrouped ? 'mt-1' : 'mt-3'}`}>
      <Pressable
        onLongPress={isActive ? onDeactivate : onActivate}
        delayLongPress={200}
        accessibilityLabel={`Message from ${name}`}
      >
        <View
          className={`flex-row items-end gap-2 ${isPending ? 'opacity-70' : ''} ${
            isMine ? 'justify-end' : 'justify-start'
          }`}
        >
          {/* Left avatar */}
          {!isMine ? (
            <View className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-ivy-accent/15 dark:bg-ivy-accent/25">
              {avatarSlot(authorImageUrl)}
            </View>
          ) : null}

          <View className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
            {/* Name + time header */}
            {!isGrouped ? (
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

            {/* Reply quote strip */}
            {replyTo ? (
              <View
                className={`mb-1 flex-row gap-1.5 rounded-xl px-2.5 py-1.5 ${
                  isMine
                    ? 'bg-zinc-200/70 dark:bg-zinc-700/60'
                    : 'bg-zinc-200/70 dark:bg-zinc-700/60'
                }`}
              >
                <View className="w-0.5 self-stretch rounded-full bg-ivy-accent opacity-70" />
                <View className="flex-1">
                  <IvyText className="text-[11px] font-semibold text-ivy-accent">
                    {replyTo.name}
                  </IvyText>
                  <IvyText
                    className="text-[12px] text-zinc-500 dark:text-zinc-400"
                    numberOfLines={1}
                  >
                    {replyTo.body}
                  </IvyText>
                </View>
              </View>
            ) : null}

            {/* Message bubble */}
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

            {/* Like badge */}
            {likeCount > 0 ? (
              <View
                className={`mt-1 flex-row items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 ${
                  isMine ? 'self-end' : 'self-start'
                }`}
              >
                <IvyText className="text-[13px]">👍</IvyText>
                {likeCount > 1 ? (
                  <IvyText className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {likeCount}
                  </IvyText>
                ) : null}
              </View>
            ) : null}

            {/* Edited tag */}
            {editedAt ? (
              <IvyText
                className={`mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500 ${
                  isMine ? 'self-end' : 'self-start'
                }`}
              >
                edited
              </IvyText>
            ) : null}
          </View>

          {/* Right avatar — own messages */}
          {isMine ? (
            <View className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-ivy-accent/15 dark:bg-ivy-accent/25">
              {avatarSlot(authorImageUrl)}
            </View>
          ) : null}
        </View>
      </Pressable>

      {/* Inline action bar — appears on long press */}
      {isActive ? (
        <View
          className={`mt-1.5 flex-row gap-2 ${isMine ? 'justify-end pr-9' : 'justify-start pl-9'}`}
        >
          {isMine ? (
            <>
              {/* Reply (own) */}
              <Pressable
                onPress={() => { onReply(); onDeactivate(); }}
                className="flex-row items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 active:opacity-75 dark:bg-zinc-800"
              >
                <IconSymbol name="arrow.clockwise" size={13} color="#71717a" />
                <IvyText className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-300">
                  Reply
                </IvyText>
              </Pressable>

              {/* Edit */}
              <Pressable
                onPress={() => { onEdit(); onDeactivate(); }}
                className="flex-row items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 active:opacity-75 dark:bg-zinc-800"
              >
                <IconSymbol name="square.and.arrow.up" size={13} color="#71717a" />
                <IvyText className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-300">
                  Edit
                </IvyText>
              </Pressable>

              {/* Delete */}
              <Pressable
                onPress={() => { onDelete(); onDeactivate(); }}
                className="flex-row items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 active:opacity-75 dark:bg-red-950/40"
              >
                <IconSymbol name="xmark" size={13} color="#ef4444" />
                <IvyText className="text-[12px] font-semibold text-red-500">
                  Delete
                </IvyText>
              </Pressable>
            </>
          ) : (
            <>
              {/* 👍 Like */}
              <Pressable
                onPress={() => { onLike(); onDeactivate(); }}
                className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 active:opacity-75 ${
                  likedByMe
                    ? 'bg-ivy-accent/20 dark:bg-ivy-accent/30'
                    : 'bg-zinc-100 dark:bg-zinc-800'
                }`}
              >
                <IvyText className="text-[15px]">👍</IvyText>
                <IvyText
                  className={`text-[12px] font-semibold ${
                    likedByMe ? 'text-ivy-accent' : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {likedByMe ? 'Liked' : 'Like'}
                </IvyText>
              </Pressable>

              {/* Reply */}
              <Pressable
                onPress={() => { onReply(); onDeactivate(); }}
                className="flex-row items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 active:opacity-75 dark:bg-zinc-800"
              >
                <IconSymbol name="arrow.clockwise" size={13} color="#71717a" />
                <IvyText className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-300">
                  Reply
                </IvyText>
              </Pressable>
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}
