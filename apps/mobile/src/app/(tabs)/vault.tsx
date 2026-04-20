import { useAuth } from '@clerk/expo';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedPostCard } from '@/components/ivy/feed-post-card';
import { IvyText } from '@/components/ivy/ivy-text';
import { ResourceRow } from '@/components/ivy/resource-row';
import { ScreenHeader } from '@/components/ivy/screen-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { vaultResources } from '@/data/mock/content';
import { trpc } from '@/lib/trpc';

export default function VaultScreen() {
  const { isSignedIn } = useAuth();
  const [draft, setDraft] = useState('');
  const utils = trpc.useUtils();
  const feedQuery = trpc.feed.list.useQuery();
  const createPost = trpc.feed.create.useMutation({
    onSuccess: () => {
      setDraft('');
      void utils.feed.list.invalidate();
    },
  });

  const trimmed = draft.trim();
  const canPost = isSignedIn && trimmed.length > 0 && !createPost.isPending;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Vault"
        left={
          <Pressable className="p-2" hitSlop={8}>
            <IconSymbol name="icloud.and.arrow.up" size={22} color="#b45309" />
          </Pressable>
        }
        right={
          <Pressable className="p-2" hitSlop={8}>
            <IconSymbol name="magnifyingglass" size={22} color="#b45309" />
          </Pressable>
        }
      />
      <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <IvyText className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Resources
          </IvyText>
          {vaultResources.map((r) => (
            <ResourceRow
              key={r.id}
              title={r.title}
              imageUrl={r.imageUrl}
              url={r.url}
            />
          ))}

          <IvyText className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            From the community
          </IvyText>

          {isSignedIn ? (
            <View className="mb-4 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <TextInput
                className="min-h-[88px] rounded-xl bg-zinc-50 px-3 py-2.5 text-[15px] leading-6 text-zinc-900 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 dark:text-zinc-100"
                placeholder="Share something with the community…"
                placeholderTextColor="#a1a1aa"
                value={draft}
                onChangeText={setDraft}
                multiline
                maxLength={5000}
                textAlignVertical="top"
              />
              <View className="mt-2 flex-row items-center justify-end gap-3">
                <IvyText className="text-xs text-zinc-400 dark:text-zinc-500">
                  {draft.length}/5000
                </IvyText>
                <Pressable
                  className="rounded-xl bg-amber-600 px-4 py-2.5 active:opacity-90 disabled:opacity-40"
                  disabled={!canPost}
                  onPress={() => createPost.mutate({ body: trimmed })}
                >
                  <IvyText className="text-center text-sm font-semibold text-white">
                    Post
                  </IvyText>
                </Pressable>
              </View>
              {createPost.isError ? (
                <IvyText className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {createPost.error.message}
                </IvyText>
              ) : null}
            </View>
          ) : (
            <IvyText className="mb-4 rounded-2xl border border-zinc-200 bg-zinc-100/80 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
              Sign in to share a post with the community.
            </IvyText>
          )}

          {feedQuery.isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator />
            </View>
          ) : feedQuery.isError ? (
            <IvyText className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {feedQuery.error.message}
            </IvyText>
          ) : feedQuery.data?.length ? (
            feedQuery.data.map((post) => (
              <View key={post.id} className="mb-4">
                <FeedPostCard
                  name={post.name}
                  time={post.time}
                  body={post.body}
                />
              </View>
            ))
          ) : (
            <IvyText className="rounded-2xl border border-zinc-200 bg-white p-4 text-[15px] leading-6 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              No community posts yet.
            </IvyText>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
