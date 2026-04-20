import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedPostCard } from '@/components/ivy/feed-post-card';
import { IvyText } from '@/components/ivy/ivy-text';
import { ResourceRow } from '@/components/ivy/resource-row';
import { ScreenHeader } from '@/components/ivy/screen-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { vaultResources } from '@/data/mock/content';
import { trpc } from '@/lib/trpc';

export default function VaultScreen() {
  const feedQuery = trpc.feed.list.useQuery();

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
                <FeedPostCard name={post.name} time={post.time} body={post.body} />
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
