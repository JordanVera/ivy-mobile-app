import { useAuth } from '@clerk/expo';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Stack } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EpisodeCommentComposer } from '@/components/ivy/episode-comment-composer';
import { EpisodeCommentRow } from '@/components/ivy/episode-comment-row';
import { FeaturedYoutubePlayer } from '@/components/ivy/featured-youtube-player';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';

const ACCENT = '#b45309';
/** How often to refetch the thread while the screen is focused (near-realtime). */
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

  const threadQuery = trpc.episodeThread.list.useQuery(
    { videoId: videoId ?? '' },
    {
      enabled: !!videoId,
      refetchInterval: isFocused ? POLL_INTERVAL_MS : false,
      refetchOnWindowFocus: true,
    },
  );

  const createComment = trpc.episodeThread.create.useMutation({
    onMutate: async ({ body }) => {
      if (!videoId) return;
      await utils.episodeThread.list.cancel({ videoId });
      const previous = utils.episodeThread.list.getData({ videoId });
      const tempId = `optimistic-${Date.now()}`;
      const optimistic = {
        id: tempId,
        authorId: 'me',
        name: 'You',
        authorImageUrl: null,
        time: 'just now',
        createdAt: new Date().toISOString(),
        body,
        mine: true,
      };
      utils.episodeThread.list.setData({ videoId }, (prev) =>
        prev
          ? { ...prev, comments: [...prev.comments, optimistic] }
          : { videoId, comments: [optimistic] },
      );
      return { previous, tempId };
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

  const handleSubmit = useCallback(
    async (body: string) => {
      if (!videoId) return;
      await createComment
        .mutateAsync({ videoId, body })
        .catch(() => undefined);
      // After the post settles, scroll to the bottom so the user sees it land.
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    },
    [createComment, videoId],
  );

  const composerDisabledReason = useMemo<string | null>(() => {
    if (!isSignedIn) {
      return 'Sign in to join the conversation.';
    }
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
          <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
            <View className="flex-row items-center justify-between px-4 py-2">
              <Pressable
                onPress={goBack}
                hitSlop={12}
                accessibilityLabel="Back"
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <IconSymbol name="chevron.left" size={24} color={ACCENT} />
              </Pressable>
              <IvyText className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
                Discussion
              </IvyText>
              <View className="h-10 w-10" />
            </View>

            <ScrollView
              ref={scrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 24,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="mt-2">
                <FeaturedYoutubePlayer videoId={videoId} />
              </View>

              {titleParam ? (
                <IvyHeading className="mt-4 text-xl leading-tight text-zinc-900 dark:text-white">
                  {titleParam}
                </IvyHeading>
              ) : null}

              <View className="mt-5 flex-row items-center justify-between">
                <IvyText className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Thread
                </IvyText>
                <View className="flex-row items-center gap-1.5">
                  {threadQuery.isFetching && !threadQuery.isLoading ? (
                    <ActivityIndicator size="small" color={ACCENT} />
                  ) : null}
                  <IvyText className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {commentCount === 0
                      ? 'Be the first to comment'
                      : commentCount === 1
                        ? '1 comment'
                        : `${commentCount} comments`}
                  </IvyText>
                </View>
              </View>

              <View className="mt-2 rounded-2xl border border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
                {threadQuery.isLoading ? (
                  <View className="items-center py-8">
                    <ActivityIndicator color={ACCENT} />
                  </View>
                ) : threadQuery.isError ? (
                  <View className="py-4">
                    <IvyText className="text-sm text-red-600 dark:text-red-400">
                      {threadQuery.error.message}
                    </IvyText>
                    <Pressable
                      onPress={() => void threadQuery.refetch()}
                      className="mt-3 self-start rounded-xl bg-zinc-100 px-4 py-2 dark:bg-zinc-800"
                    >
                      <IvyText className="text-sm font-medium text-zinc-900 dark:text-white">
                        Retry
                      </IvyText>
                    </Pressable>
                  </View>
                ) : comments.length === 0 ? (
                  <View className="items-center py-8">
                    <IconSymbol
                      name="bubble.left.and.bubble.right.fill"
                      size={28}
                      color="#a1a1aa"
                    />
                    <IvyText className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      No comments yet. Start the conversation.
                    </IvyText>
                  </View>
                ) : (
                  comments.map((c, idx) => (
                    <View
                      key={c.id}
                      className={
                        idx < comments.length - 1
                          ? 'border-b border-zinc-100 dark:border-zinc-800'
                          : ''
                      }
                    >
                      <EpisodeCommentRow
                        name={c.name}
                        time={c.time}
                        body={c.body}
                        authorImageUrl={c.authorImageUrl}
                        variant={
                          c.id.startsWith('optimistic-')
                            ? 'pending'
                            : c.mine
                              ? 'mine'
                              : 'default'
                        }
                      />
                    </View>
                  ))
                )}
              </View>

              <View className="mt-4">
                <EpisodeCommentComposer
                  disabledReason={composerDisabledReason}
                  onSubmit={handleSubmit}
                  submitting={createComment.isPending}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
