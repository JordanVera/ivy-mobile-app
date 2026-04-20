import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeaturedYoutubePlayer } from '@/components/ivy/featured-youtube-player';
import { IvyText } from '@/components/ivy/ivy-text';
import { ScreenHeader } from '@/components/ivy/screen-header';
import { VideoThumbnailCard } from '@/components/ivy/video-thumbnail-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { watchCategories } from '@/data/mock/content';
import { trpc } from '@/lib/trpc';

export default function WatchScreen() {
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState<string>(watchCategories[0]);
  const { data, isLoading, isError, error } =
    trpc.youtube.playlistVideos.useQuery();
  const gap = 12;
  const colWidth = (width - 32 - gap) / 2;

  const videos = data?.videos ?? [];
  const featuredId = videos[0]?.videoId;
  const moreVideos = videos.slice(1);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        className="flex-1 bg-zinc-50 dark:bg-zinc-950"
        style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 8 }}
      >
        {/* <CategoryChips
          categories={watchCategories}
          selected={category}
          onSelect={(c) => setCategory(c)}
        /> */}
        {/* Show appropriate logo based on theme */}
        {/* <View className="w-full items-center my-4">
          <Image
            source={
              useColorScheme() === 'dark'
                ? require('@/assets/images/ivy-mmm-logo-white.png')
                : require('@/assets/images/ivy-mmm-logo-black.png')
            }
            style={{ width: '100%', height: 100, resizeMode: 'contain' }}
          />
        </View> */}

        {/* <IvyText className="my-2 text-sm font-semibold text-zinc-900 dark:text-white">
          Featured
        </IvyText> */}
        <View className="my-2">
          {isLoading && !featuredId ? (
            <View className="aspect-video w-full items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800">
              <ActivityIndicator color="#b45309" size="large" />
            </View>
          ) : (
            <FeaturedYoutubePlayer videoId={featuredId} />
          )}
        </View>

        {isError ? (
          <IvyText className="mt-2 text-xs text-red-600 dark:text-red-400">
            {error.message}
          </IvyText>
        ) : null}

        <IvyText className="mb-3 mt-6 text-sm font-semibold text-zinc-900 dark:text-white">
          More to watch
        </IvyText>

        {isLoading && moreVideos.length === 0 ? (
          <View className="py-8">
            <ActivityIndicator color="#b45309" />
          </View>
        ) : null}

        <View className="flex-row flex-wrap" style={{ gap }}>
          {moreVideos.map((item) => (
            <View key={item.videoId} style={{ width: colWidth }}>
              <VideoThumbnailCard
                title={item.title}
                duration={item.durationLabel}
                live={item.live}
                thumbnailUrl={item.thumbnailUrl}
                videoId={item.videoId}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
