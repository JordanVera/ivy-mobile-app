import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { ScreenHeader } from '@/components/ivy/screen-header';
import { VideoThumbnailCard } from '@/components/ivy/video-thumbnail-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';

const ACCENT = '#b45309';

function toHttpsThumbnailUri(url: string): string {
  const t = url.trim();
  if (t.startsWith('//')) return `https:${t}`;
  return t;
}

export default function WatchScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error } =
    trpc.youtube.playlistVideos.useQuery();

  const videos = data?.videos ?? [];
  const featured = videos[0];
  const featuredId = featured?.videoId;
  const moreVideos = videos.slice(1);

  const featuredThreadCount = trpc.episodeThread.counts.useQuery(
    { videoIds: featuredId ? [featuredId] : [] },
    {
      enabled: !!featuredId,
      refetchOnWindowFocus: true,
      staleTime: 10_000,
    },
  );
  const featuredCommentCount =
    featuredId && featuredThreadCount.data
      ? (featuredThreadCount.data[featuredId] ?? 0)
      : 0;

  const openFeaturedDiscussion = () => {
    if (!featured?.videoId) return;
    router.push({
      pathname: '/episode/[videoId]',
      params: { videoId: featured.videoId, title: featured.title },
    } as Href);
  };

  const featuredThumb = featured?.thumbnailUrl?.trim()
    ? toHttpsThumbnailUri(featured.thumbnailUrl)
    : null;

  const featuredCommentLabel =
    featuredCommentCount === 0
      ? 'Join the discussion'
      : featuredCommentCount === 1
        ? '1 comment · Join the discussion'
        : `${featuredCommentCount} comments · Join the discussion`;

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={['top', 'left', 'right']}
      className="bg-zinc-50 dark:bg-zinc-950"
    >
      <ScreenHeader
        title="Watch"
        left={
          <Pressable className="p-2" hitSlop={8}>
            <IconSymbol name="magnifyingglass" size={22} color={ACCENT} />
          </Pressable>
        }
        right={
          <Pressable className="p-2" hitSlop={8}>
            <IconSymbol name="line.3.horizontal" size={22} color={ACCENT} />
          </Pressable>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        className="flex-1 bg-zinc-50 dark:bg-zinc-950"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {isLoading && !featured ? (
          <View className="aspect-4/5 w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">
            <ActivityIndicator color={ACCENT} size="large" />
          </View>
        ) : featured ? (
          <Pressable
            onPress={openFeaturedDiscussion}
            accessibilityRole="button"
            accessibilityLabel={`Open featured episode ${featured.title}`}
            className="active:opacity-90"
          >
            <View
              className="w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900"
              style={styles.heroFrame}
            >
              {featuredThumb ? (
                <Image
                  source={{ uri: featuredThumb }}
                  style={StyleSheet.absoluteFillObject}
                  contentFit="cover"
                  accessible={false}
                />
              ) : null}

              <LinearGradient
                colors={[
                  'rgba(0,0,0,0.05)',
                  'rgba(0,0,0,0.1)',
                  'rgba(0,0,0,0.85)',
                ]}
                locations={[0, 0.45, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />

              <View
                pointerEvents="none"
                className="items-center justify-center"
                style={StyleSheet.absoluteFillObject}
              >
                <View className="h-16 w-16 items-center justify-center rounded-full bg-white/95">
                  <IconSymbol name="play.fill" size={26} color="#000" />
                </View>
              </View>

              {featured.live ? (
                <View className="absolute left-4 top-4 z-10 flex-row items-center gap-1.5 rounded-sm bg-red-600 px-2.5 py-1">
                  <View className="h-1.5 w-1.5 rounded-full bg-white" />
                  <IvyText className="text-[11px] font-bold uppercase tracking-[2px] text-white">
                    Live
                  </IvyText>
                </View>
              ) : (
                <View className="absolute right-4 top-4 z-10 rounded-sm bg-black/55 px-2.5 py-1">
                  <IvyText className="text-[11px] font-medium tracking-wide text-white">
                    {featured.durationLabel}
                  </IvyText>
                </View>
              )}

              <View className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-7">
                <IvyText className="text-[10px] font-semibold uppercase tracking-[3px] text-amber-300">
                  Featured
                </IvyText>
                <IvyHeading
                  level="brand"
                  className="mt-2 text-[28px] leading-[1.1] text-white"
                  numberOfLines={4}
                >
                  {featured.title}
                </IvyHeading>
              </View>
            </View>
          </Pressable>
        ) : null}

        {featured?.videoId ? (
          <Pressable
            onPress={openFeaturedDiscussion}
            accessibilityRole="button"
            accessibilityLabel="Open discussion for featured episode"
            className="mx-5 mt-4 flex-row items-center justify-between border-b border-zinc-200 pb-4 active:opacity-70 dark:border-zinc-800"
          >
            <View className="flex-row items-center gap-2">
              <IconSymbol
                name="bubble.left.and.bubble.right.fill"
                size={16}
                color={ACCENT}
              />
              <IvyText className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">
                {featuredCommentLabel}
              </IvyText>
            </View>
            <IconSymbol name="chevron.right" size={14} color="#a1a1aa" />
          </Pressable>
        ) : null}

        {isError ? (
          <IvyText className="mx-5 mt-4 text-xs text-red-600 dark:text-red-400">
            {error.message}
          </IvyText>
        ) : null}

        <View className="mx-5 mt-10 mb-5 items-center">
          <IvyText className="text-[10px] font-semibold uppercase tracking-[3px] text-zinc-500 dark:text-zinc-400">
            More to watch
          </IvyText>
          <View className="mt-3 h-px w-12 bg-amber-700 dark:bg-amber-500" />
        </View>

        {isLoading && moreVideos.length === 0 ? (
          <View className="py-8">
            <ActivityIndicator color={ACCENT} />
          </View>
        ) : null}

        <View>
          {moreVideos.map((item) => (
            <VideoThumbnailCard
              key={item.videoId}
              title={item.title}
              duration={item.durationLabel}
              live={item.live}
              thumbnailUrl={item.thumbnailUrl}
              videoId={item.videoId}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroFrame: {
    width: '100%',
    aspectRatio: 4 / 5,
    position: 'relative',
    overflow: 'hidden',
  },
});
