import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedPostCard } from '@/components/ivy/feed-post-card';
import { IvyText } from '@/components/ivy/ivy-text';
import { ResourceRow } from '@/components/ivy/resource-row';
import { ScreenHeader } from '@/components/ivy/screen-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { vaultFeedPost, vaultResources } from '@/data/mock/content';

export default function VaultScreen() {
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
            <ResourceRow key={r.id} title={r.title} />
          ))}

          <IvyText className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            From the community
          </IvyText>
          <FeedPostCard
            name={vaultFeedPost.name}
            time={vaultFeedPost.time}
            body={vaultFeedPost.body}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
