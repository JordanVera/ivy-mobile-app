import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';
import { trpc } from '@/lib/trpc';

import { IvyText } from './ivy-text';

type FeedCommentRow = {
  id: string;
  name: string;
  time: string;
  body: string;
};

type FeedPostCardProps = {
  postId: string;
  name: string;
  time: string;
  body: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isSignedIn: boolean;
};

export function FeedPostCard({
  postId,
  name,
  time,
  body,
  likeCount,
  commentCount,
  likedByMe,
  isSignedIn,
}: FeedPostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const utils = trpc.useUtils();

  const toggleLike = trpc.feed.toggleLike.useMutation({
    onSuccess: () => void utils.feed.list.invalidate(),
  });

  const commentsQuery = trpc.feed.comments.useQuery(
    { postId },
    { enabled: commentsOpen },
  );

  const addComment = trpc.feed.addComment.useMutation({
    onSuccess: () => {
      setCommentDraft('');
      void utils.feed.list.invalidate();
      void utils.feed.comments.invalidate({ postId });
    },
  });

  const trimmedComment = commentDraft.trim();
  const canSendComment =
    isSignedIn &&
    trimmedComment.length > 0 &&
    !addComment.isPending;

  const heartColor = likedByMe ? IvyColors.accent : '#a1a1aa';

  return (
    <View className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <View className="mb-3 flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-ivy-accent/15 dark:bg-ivy-accent/25">
          <IconSymbol
            name="person.crop.circle.fill"
            size={32}
            color={IvyColors.accent}
          />
        </View>
        <View className="flex-1">
          <IvyText className="text-base font-semibold text-zinc-900 dark:text-white">
            {name}
          </IvyText>
          <IvyText className="text-xs text-zinc-500 dark:text-zinc-400">
            {time}
          </IvyText>
        </View>
      </View>
      <IvyText className="text-[15px] leading-6 text-zinc-700 dark:text-zinc-300">
        {body}
      </IvyText>

      <View className="mt-4 flex-row flex-wrap gap-6 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <Pressable
          className="flex-row items-center gap-1.5 active:opacity-70 disabled:opacity-40"
          disabled={!isSignedIn || toggleLike.isPending}
          onPress={() => toggleLike.mutate({ postId })}
        >
          <IconSymbol name="heart.fill" size={22} color={heartColor} />
          <IvyText className="text-sm text-zinc-500 dark:text-zinc-400">
            {likeCount > 0 ? String(likeCount) : 'Like'}
          </IvyText>
        </Pressable>
        <Pressable
          className="flex-row items-center gap-1.5 active:opacity-70"
          onPress={() => setCommentsOpen((o) => !o)}
        >
          <IconSymbol
            name="bubble.left.and.bubble.right.fill"
            size={22}
            color={commentsOpen ? IvyColors.accent : '#a1a1aa'}
          />
          <IvyText className="text-sm text-zinc-500 dark:text-zinc-400">
            {commentCount > 0 ? String(commentCount) : 'Comment'}
          </IvyText>
        </Pressable>
      </View>

      {commentsOpen ? (
        <View className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          {commentsQuery.isLoading ? (
            <View className="py-3">
              <ActivityIndicator />
            </View>
          ) : commentsQuery.isError ? (
            <IvyText className="text-sm text-red-600 dark:text-red-400">
              {commentsQuery.error.message}
            </IvyText>
          ) : commentsQuery.data?.length ? (
            commentsQuery.data.map((c: FeedCommentRow) => (
              <View key={c.id} className="mb-3 border-b border-zinc-100 pb-3 last:mb-0 last:border-b-0 last:pb-0 dark:border-zinc-800">
                <View className="flex-row items-baseline justify-between gap-2">
                  <IvyText className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {c.name}
                  </IvyText>
                  <IvyText className="text-xs text-zinc-400 dark:text-zinc-500">
                    {c.time}
                  </IvyText>
                </View>
                <IvyText className="mt-1 text-[14px] leading-5 text-zinc-600 dark:text-zinc-400">
                  {c.body}
                </IvyText>
              </View>
            ))
          ) : (
            <IvyText className="text-sm text-zinc-500 dark:text-zinc-400">
              No comments yet.
            </IvyText>
          )}

          {isSignedIn ? (
            <View className="mt-2">
              <TextInput
                className="min-h-[72px] rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[14px] leading-5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                placeholder="Write a comment…"
                placeholderTextColor="#a1a1aa"
                value={commentDraft}
                onChangeText={setCommentDraft}
                multiline
                maxLength={2000}
                textAlignVertical="top"
              />
              <View className="mt-2 flex-row items-center justify-between">
                <IvyText className="text-xs text-zinc-400 dark:text-zinc-500">
                  {commentDraft.length}/2000
                </IvyText>
                <Pressable
                  className="rounded-lg bg-ivy-accent px-3 py-2 active:opacity-90 disabled:opacity-40"
                  disabled={!canSendComment}
                  onPress={() =>
                    addComment.mutate({ postId, body: trimmedComment })
                  }
                >
                  <IvyText className="text-sm font-semibold text-white">
                    Reply
                  </IvyText>
                </Pressable>
              </View>
              {addComment.isError ? (
                <IvyText className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {addComment.error.message}
                </IvyText>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
