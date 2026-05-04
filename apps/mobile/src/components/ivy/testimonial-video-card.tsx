import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { grayscaleBackdropWebClassName } from '@/components/ivy/grayscale-cover-image';

import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

export type TestimonialVideoCardProps = {
  /** Display name of the speaker (e.g. "Oprah Winfrey"). */
  name: string;
  /** Short role / context line shown under the name. */
  role: string;
  /** Pull quote rendered above the video as an editorial lede. */
  quote: string;
  /** A bundled mp4 asset reference produced by `require('@/assets/...')`. */
  source: number;
  /** Whether this card should auto-pause when another begins playing. */
  active?: boolean;
  /** Notify the parent that this card started playing — used to coordinate exclusivity. */
  onPlay?: () => void;
};

/**
 * Editorial portrait card that plays a single local testimonial clip.
 * Tapping the poster reveals the native video controls and starts playback;
 * the parent can pass `active={false}` to pause this card while another plays.
 */
export function TestimonialVideoCard({
  name,
  role,
  quote,
  source,
  active = true,
  onPlay,
}: TestimonialVideoCardProps) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.muted = false;
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  useEffect(() => {
    if (!active && isPlaying) {
      player.pause();
    }
  }, [active, isPlaying, player]);

  // Notify the parent only on the false → true transition so we don't churn
  // through state updates every time the card re-renders while playing.
  const wasPlayingRef = useRef(false);
  useEffect(() => {
    if (isPlaying && !wasPlayingRef.current) {
      onPlay?.();
    }
    wasPlayingRef.current = isPlaying;
  }, [isPlaying, onPlay]);

  const handlePosterPress = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <View className="px-5 pt-5">
        <IvyText className="text-[10px] font-semibold uppercase tracking-[3px] text-ivy-accent">
          In their words
        </IvyText>
        <IvyHeading
          level="brand"
          className="mt-3 text-[22px] leading-tight text-zinc-900 dark:text-white"
        >
          “{quote}”
        </IvyHeading>
      </View>

      <View
        className={`mt-5 w-full bg-black${!isPlaying && Platform.OS === 'web' ? ` ${grayscaleBackdropWebClassName}` : ''}`}
        style={styles.videoFrame}
      >
        <VideoView
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          nativeControls
          allowsFullscreen
          allowsPictureInPicture
        />

        {!isPlaying ? (
          <Pressable
            onPress={handlePosterPress}
            accessibilityRole="button"
            accessibilityLabel={`Play testimonial from ${name}`}
            style={StyleSheet.absoluteFillObject}
            className="items-center justify-center"
          >
            <View className="h-16 w-16 items-center justify-center rounded-full bg-white/95">
              <IconSymbol name="play.fill" size={26} color="#000" />
            </View>
          </Pressable>
        ) : null}
      </View>

      <View className="px-5 py-4">
        <IvyText className="text-[15px] font-semibold text-zinc-900 dark:text-white">
          {name}
        </IvyText>
        <IvyText className="mt-0.5 text-[12px] text-zinc-500 dark:text-zinc-400">
          {role}
        </IvyText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  videoFrame: {
    aspectRatio: 9 / 16,
    position: 'relative',
    overflow: 'hidden',
  },
});
