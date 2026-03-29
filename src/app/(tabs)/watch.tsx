import { useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChips } from '@/components/ivy/category-chips';
import { FeaturedYoutubePlayer } from '@/components/ivy/featured-youtube-player';
import { IvyText } from '@/components/ivy/ivy-text';
import { ScreenHeader } from '@/components/ivy/screen-header';
import { VideoThumbnailCard } from '@/components/ivy/video-thumbnail-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { watchCategories, watchFeedItems } from '@/data/mock/content';

export default function WatchScreen() {
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState<string>(watchCategories[0]);
  const gap = 12;
  const colWidth = (width - 32 - gap) / 2;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 8 }}>
        <ScreenHeader
          title="Watch"
          left={
            <Pressable className="p-2" hitSlop={8}>
              <IconSymbol name="magnifyingglass" size={22} color="#b45309" />
            </Pressable>
          }
          right={
            <Pressable className="p-2" hitSlop={8}>
              <IconSymbol name="line.3.horizontal" size={22} color="#b45309" />
            </Pressable>
          }
        />

        <CategoryChips
          categories={watchCategories}
          selected={category}
          onSelect={(c) => setCategory(c)}
        />

        <IvyText className="mb-2 text-sm font-semibold text-zinc-900 dark:text-white">
          Featured
        </IvyText>
        <FeaturedYoutubePlayer />

        <IvyText className="mb-3 mt-6 text-sm font-semibold text-zinc-900 dark:text-white">
          More to watch
        </IvyText>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap" style={{ gap }}>
            {watchFeedItems.map((item) => (
              <View key={item.id} style={{ width: colWidth }}>
                <VideoThumbnailCard
                  title={item.title}
                  duration={item.duration}
                  live={item.live}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
