import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

import { IvyHeading } from './ivy-heading';
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
  /** Optional small uppercase label rendered above the title (defaults to "Watch"/"Live"). */
  eyebrow?: string;
  /**
   * Local poster image (from `require(...)`) to use as the card cover. Takes
   * precedence over `thumbnailUrl` – used in the Watch feed so we can show
   * portrait editorial photos instead of 16:9 YouTube thumbs.
   */
  posterSource?: ImageSource | number | null;
};

/**
 * Editorial, photo-forward card used in the Watch feed.
 * Single column, full-width thumbnail with a serif title beneath – styled after
 * the cover blocks in Vogue's mobile app where imagery dominates and text
 * supports.
 */
export function VideoThumbnailCard({
  title,
  duration,
  live,
  thumbnailUrl,
  videoId,
  eyebrow,
  posterSource,
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

  const remoteUri = thumbnailUrl?.trim()
    ? toHttpsThumbnailUri(thumbnailUrl)
    : null;
  const imageSource: ImageSource | number | null =
    posterSource ?? (remoteUri ? { uri: remoteUri } : null);
  const label = eyebrow ?? (live ? 'Live now' : 'Watch');

  const card = (
    <View className="mb-8">
      <View
        className="w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900"
        style={styles.thumbArea}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            accessible={false}
          />
        ) : null}

        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)']}
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
          <View className="h-14 w-14 items-center justify-center rounded-full bg-white/90">
            <IconSymbol name="play.fill" size={22} color="#000" />
          </View>
        </View>

        {live ? (
          <View className="absolute left-3 top-3 z-10 flex-row items-center gap-1.5 rounded-sm bg-red-600 px-2 py-0.5">
            <View className="h-1.5 w-1.5 rounded-full bg-white" />
            <IvyText className="text-[10px] font-bold uppercase tracking-widest text-white">
              Live
            </IvyText>
          </View>
        ) : (
          <View className="absolute bottom-3 right-3 z-10 rounded-sm bg-black/60 px-2 py-0.5">
            <IvyText className="text-[11px] font-medium tracking-wide text-white">
              {duration}
            </IvyText>
          </View>
        )}
      </View>

      <View className="px-4 pt-3">
        <IvyText className="text-[10px] font-semibold uppercase tracking-[2px] text-ivy-accent">
          {label}
        </IvyText>
        <IvyHeading
          className="mt-1.5 text-[22px] leading-[1.2] text-zinc-900 dark:text-white"
          numberOfLines={3}
        >
          {title}
        </IvyHeading>
      </View>
    </View>
  );

  if (id) {
    return (
      <Pressable
        onPress={openEpisode}
        accessibilityRole="button"
        accessibilityLabel={`Open discussion for ${title}`}
        className="active:opacity-80"
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
    aspectRatio: 4 / 5,
    position: 'relative',
    overflow: 'hidden',
  },
});
