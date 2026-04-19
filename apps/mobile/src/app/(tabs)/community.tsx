import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CommunityPillarCard } from '@/components/ivy/community-pillar-card';
import { IvyText } from '@/components/ivy/ivy-text';
import { ScreenHeader } from '@/components/ivy/screen-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { communityActivity, communityPillars } from '@/data/mock/content';

export default function CommunityScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Community"
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
            Channels
          </IvyText>
          {communityPillars.map((p) => (
            <CommunityPillarCard
              key={p.id}
              title={p.title}
              subtitle={p.subtitle}
              icon={p.icon}
            />
          ))}

          <IvyText className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Recent activity
          </IvyText>
          {communityActivity.map((a) => (
            <View
              key={a.id}
              className="mb-3 flex-row gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <IconSymbol
                  name="person.crop.circle.fill"
                  size={28}
                  color="#b45309"
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <IvyText className="font-semibold text-zinc-900 dark:text-white">
                    {a.name}
                  </IvyText>
                  <IvyText className="text-xs text-zinc-500 dark:text-zinc-400">
                    {a.time}
                  </IvyText>
                </View>
                <IvyText className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {a.snippet}
                </IvyText>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
