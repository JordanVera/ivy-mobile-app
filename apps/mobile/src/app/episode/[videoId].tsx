import { useAuth } from '@clerk/expo';
import { useIsFocused } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ExchangeComposer,
  type EditTarget,
  type ReplyTarget,
} from '@/components/ivy/exchange-composer';
import { ExchangeMessageRow } from '@/components/ivy/exchange-message-row';
import { FeaturedYoutubePlayer } from '@/components/ivy/featured-youtube-player';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';
import { trpc } from '@/lib/trpc';

const ACCENT = IvyColors.accent;
const POLL_INTERVAL_MS = 4000;

export default function EpisodeScreen() {
  const { videoId: videoIdParam, title: titleParam } = useLocalSearchParams<{
    videoId: string;
    title?: string;
  }>();
  const videoId = Array.isArray(videoIdParam) ? videoIdParam[0] : videoIdParam;

  const router = useRouter();
  const isFocused = useIsFocused();
  const { isSignedIn } = useAuth();
  const utils = trpc.useUtils();
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  const threadQuery = trpc.episodeThread.list.useQuery(
    { videoId: videoId ?? '' },
    {
      enabled: !!videoId,
      refetchInterval: isFocused ? POLL_INTERVAL_MS : false,
      refetchOnWindowFocus: true,
    },
  );

  // ── Send ────────────────────────────────────────────────────────────────────
  const createComment = trpc.episodeThread.create.useMutation({
    onMutate: async ({ body }) => {
      if (!videoId) return;
      await utils.episodeThread.list.cancel({ videoId });
      const previous = utils.episodeThread.list.getData({ videoId });
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        authorId: 'me',
        name: 'You',
        authorImageUrl: null,
        time: 'just now',
        createdAt: new Date().toISOString(),
        body,
        editedAt: null as string | null,
        mine: true,
        likeCount: 0,
        likedByMe: false,
        replyTo: replyTo
          ? { id: replyTo.id, name: replyTo.name, body: replyTo.body }
          : null,
      };
      utils.episodeThread.list.setData({ videoId }, (prev) =>
        prev
          ? { ...prev, comments: [...prev.comments, optimistic] }
          : { videoId, comments: [optimistic] },
      );
      return { previous };
    },
    onError: (err, _input, context) => {
      if (!videoId) return;
      if (context?.previous) {
        utils.episodeThread.list.setData({ videoId }, context.previous);
      }
      Alert.alert('Could not post comment', err.message);
    },
    onSettled: () => {
      if (!videoId) return;
      void utils.episodeThread.list.invalidate({ videoId });
    },
  });

  // ── Edit ────────────────────────────────────────────────────────────────────
  const editComment = trpc.episodeThread.editComment.useMutation({
    onMutate: async ({ commentId, body }) => {
      if (!videoId) return;
      await utils.episodeThread.list.cancel({ videoId });
      const previous = utils.episodeThread.list.getData({ videoId });
      utils.episodeThread.list.setData({ videoId }, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.map((c) =>
            c.id === commentId ? { ...c, body } : c,
          ),
        };
      });
      return { previous };
    },
    onError: (err, _input, context) => {
      if (!videoId || !context?.previous) return;
      utils.episodeThread.list.setData({ videoId }, context.previous);
      Alert.alert('Could not edit comment', err.message);
    },
    onSettled: () => {
      if (videoId) void utils.episodeThread.list.invalidate({ videoId });
    },
  });

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteComment = trpc.episodeThread.deleteComment.useMutation({
    onMutate: async ({ commentId }) => {
      if (!videoId) return;
      await utils.episodeThread.list.cancel({ videoId });
      const previous = utils.episodeThread.list.getData({ videoId });
      utils.episodeThread.list.setData({ videoId }, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.filter((c) => c.id !== commentId),
        };
      });
      return { previous };
    },
    onError: (err, _input, context) => {
      if (!videoId || !context?.previous) return;
      utils.episodeThread.list.setData({ videoId }, context.previous);
      Alert.alert('Could not delete comment', err.message);
    },
    onSettled: () => {
      if (videoId) void utils.episodeThread.list.invalidate({ videoId });
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (body: string) => {
      if (!videoId) return;
      setReplyTo(null);
      await createComment.mutateAsync({ videoId, body }).catch(() => undefined);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    },
    [createComment, videoId],
  );

  const handleSaveEdit = useCallback(
    async (commentId: string, body: string) => {
      setEditTarget(null);
      await editComment.mutateAsync({ commentId, body }).catch(() => undefined);
    },
    [editComment],
  );

  const handleDeleteConfirm = useCallback(
    (commentId: string) => {
      Alert.alert(
        'Delete comment',
        'This will permanently remove your comment. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteComment.mutate({ commentId }),
          },
        ],
      );
    },
    [deleteComment],
  );

  const composerDisabledReason = useMemo<string | null>(() => {
    if (!isSignedIn) return 'Sign in to join the conversation.';
    return null;
  }, [isSignedIn]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/watch' as Href);
  };

  if (!videoId) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View className="flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
          <IvyText className="text-center text-zinc-700 dark:text-zinc-300">
            Missing video ID.
          </IvyText>
        </View>
      </SafeAreaView>
    );
  }

  const comments = threadQuery.data?.comments ?? [];
  const commentCount = comments.length;
  const commentLabel =
    commentCount === 0
      ? 'Be the first'
      : commentCount === 1
        ? '1 comment'
        : `${commentCount} comments`;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={{ flex: 1 }}
        edges={['top', 'left', 'right']}
        className="bg-zinc-50 dark:bg-zinc-950"
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Scrollable content */}
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => setActiveMessageId(null)}
          >
            {/* Video player */}
            <View className="relative w-full bg-black">
              <FeaturedYoutubePlayer videoId={videoId} />
              <View className="absolute left-3 top-3 z-20">
                <Pressable
                  onPress={goBack}
                  hitSlop={12}
                  accessibilityLabel="Back"
                  className="h-9 w-9 items-center justify-center rounded-full bg-black/55 active:opacity-80"
                >
                  <IconSymbol name="chevron.left" size={20} color="#fff" />
                </Pressable>
              </View>
            </View>

            {/* Episode header */}
            <View className="px-5 pt-6">
              <View className="items-center">
                <IvyText className="text-[10px] font-semibold uppercase tracking-[3px] text-ivy-accent">
                  Episode
                </IvyText>
                <View className="mt-2 h-px w-10 bg-ivy-accent" />
              </View>
              {titleParam ? (
                <IvyHeading
                  level="brand"
                  className="mt-5 text-center text-[26px] leading-[1.2] text-zinc-900 dark:text-white"
                >
                  {titleParam}
                </IvyHeading>
              ) : null}
            </View>

            <View className="mx-5 mt-8 border-t border-zinc-200 dark:border-zinc-800" />

            {/* Discussion section label */}
            <View className="mx-5 mt-6 flex-row items-center justify-between">
              <IvyText className="text-[10px] font-semibold uppercase tracking-[3px] text-zinc-500 dark:text-zinc-400">
                Discussion
              </IvyText>
              <View className="flex-row items-center gap-1.5">
                {threadQuery.isFetching && !threadQuery.isLoading ? (
                  <ActivityIndicator size="small" color={ACCENT} />
                ) : null}
                <IvyText className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {commentLabel}
                </IvyText>
              </View>
            </View>

            {/* Messages */}
            <Pressable onPress={() => setActiveMessageId(null)}>
              <View className="mx-5 mt-4">
                {threadQuery.isLoading ? (
                  <View className="items-center py-10">
                    <ActivityIndicator color={ACCENT} />
                  </View>
                ) : threadQuery.isError ? (
                  <View className="py-6">
                    <IvyText className="text-sm text-red-600 dark:text-red-400">
                      {threadQuery.error.message}
                    </IvyText>
                    <Pressable
                      onPress={() => void threadQuery.refetch()}
                      className="mt-3 self-start rounded-full border border-zinc-300 px-4 py-2 dark:border-zinc-700"
                    >
                      <IvyText className="text-[11px] font-semibold uppercase tracking-[2px] text-zinc-900 dark:text-white">
                        Retry
                      </IvyText>
                    </Pressable>
                  </View>
                ) : comments.length === 0 ? (
                  <View className="items-center py-10">
                    <IconSymbol
                      name="bubble.left.and.bubble.right.fill"
                      size={26}
                      color="#a1a1aa"
                    />
                    <IvyText className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      No comments yet. Start the conversation.
                    </IvyText>
                  </View>
                ) : (
                  comments.map((c, idx) => {
                    const prev = idx > 0 ? comments[idx - 1] : null;
                    const compact =
                      prev != null &&
                      prev.authorId === c.authorId &&
                      !c.id.startsWith('optimistic-') &&
                      !prev.id.startsWith('optimistic-');
                    const variant = c.id.startsWith('optimistic-')
                      ? 'pending'
                      : c.mine
                        ? 'mine'
                        : 'default';
                    return (
                      <ExchangeMessageRow
                        key={c.id}
                        id={c.id}
                        name={c.name}
                        time={c.time}
                        body={c.body}
                        authorImageUrl={c.authorImageUrl}
                        variant={variant}
                        compact={compact}
                        likeCount={c.likeCount}
                        likedByMe={c.likedByMe}
                        editedAt={c.editedAt}
                        replyTo={c.replyTo}
                        isActive={activeMessageId === c.id}
                        onActivate={() => setActiveMessageId(c.id)}
                        onDeactivate={() => setActiveMessageId(null)}
                        onLike={() => undefined}
                        onReply={() => {
                          setEditTarget(null);
                          setReplyTo({ id: c.id, name: c.name, body: c.body });
                        }}
                        onEdit={() => {
                          setReplyTo(null);
                          setEditTarget({ id: c.id, body: c.body });
                        }}
                        onDelete={() => handleDeleteConfirm(c.id)}
                      />
                    );
                  })
                )}
              </View>
            </Pressable>
          </ScrollView>

          {/* Composer — sticky at bottom, mirrors hub/[slug].tsx */}
          <View
            style={{ paddingBottom: insets.bottom }}
            className="border-t border-zinc-200 bg-zinc-50 px-4 pt-3 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <ExchangeComposer
              disabledReason={composerDisabledReason}
              onSubmit={handleSubmit}
              onSaveEdit={handleSaveEdit}
              submitting={createComment.isPending || editComment.isPending}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              editTarget={editTarget}
              onCancelEdit={() => setEditTarget(null)}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
