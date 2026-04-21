import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

import { IvyText } from './ivy-text';

function toHttpsThumbnailUri(url: string): string {
  const t = url.trim();
  if (t.startsWith('//')) return `https:${t}`;
  return t;
}

type VideoThumbnailCardProps = {
  title: string;
  duration: string;
  live?: boolean;
  thumbnailUrl?: string | null;
  videoId?: string | null;
};

export function VideoThumbnailCard({
  title,
  duration,
  live,
  thumbnailUrl,
  videoId,
}: VideoThumbnailCardProps) {
  const router = useRouter();
  const id = videoId?.trim() ?? '';

  const openEpisode = () => {
    if (!id) return;
    router.push({
      pathname: '/episode/[videoId]',
      params: { videoId: id, title },
    } as Href);
  };

  const thumbUri = thumbnailUrl?.trim()
    ? toHttpsThumbnailUri(thumbnailUrl)
    : null;

  const card = (
    <View className="mb-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <View
        className="w-full bg-zinc-200 dark:bg-zinc-950"
        style={styles.thumbArea}
      >
        {thumbUri ? (
          <Image
            source={{ uri: thumbUri }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            accessible={false}
          />
        ) : null}
        <View
          pointerEvents="none"
          className="items-center justify-center"
          style={StyleSheet.absoluteFillObject}
        >
          <IconSymbol name="play.circle.fill" size={40} color="#b45309" />
        </View>
        {live ? (
          <View className="absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-0.5">
            <IvyText className="text-xs font-bold text-white">LIVE</IvyText>
          </View>
        ) : null}
      </View>
      <View className="p-2">
        <IvyText
          className="text-sm font-semibold text-zinc-900 dark:text-white"
          numberOfLines={2}
        >
          {title}
        </IvyText>
        <IvyText className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {duration}
        </IvyText>
      </View>
    </View>
  );

  if (id) {
    return (
      <Pressable
        onPress={openEpisode}
        accessibilityRole="button"
        accessibilityLabel={`Open discussion for ${title}`}
        className="active:opacity-90"
      >
        {card}
      </Pressable>
    );
  }

  return card;
}

const styles = StyleSheet.create({
  thumbArea: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    overflow: 'hidden',
  },
});
