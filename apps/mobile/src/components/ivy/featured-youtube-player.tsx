import * as Linking from 'expo-linking';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

import { IvyColors } from '@/constants/ivy-colors';
import { YOUTUBE_PLACEHOLDER_VIDEO_ID } from '@/constants/youtube';

import { IvyText } from './ivy-text';

type FeaturedYoutubePlayerProps = {
  /** When set, embeds this video; otherwise uses the app placeholder ID. */
  videoId?: string | null;
};

export function FeaturedYoutubePlayer({ videoId }: FeaturedYoutubePlayerProps) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const resolvedId = (videoId?.trim() || YOUTUBE_PLACEHOLDER_VIDEO_ID) as string;
  const watchUrl = `https://www.youtube.com/watch?v=${resolvedId}`;

  useEffect(() => {
    setReady(false);
    setFailed(false);
  }, [resolvedId]);

  const openYoutube = useCallback(() => {
    void Linking.openURL(watchUrl);
  }, [watchUrl]);

  if (Platform.OS === 'web') {
    return (
      <View className="aspect-video w-full items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800">
        <Pressable
          onPress={openYoutube}
          className="rounded-xl bg-ivy-accent px-4 py-3 active:opacity-90"
        >
          <IvyText className="font-semibold text-zinc-900">
            Open in YouTube (web)
          </IvyText>
        </Pressable>
      </View>
    );
  }

  if (failed) {
    return (
      <View className="aspect-video w-full items-center justify-center rounded-xl bg-zinc-200 p-4 dark:bg-zinc-800">
        <IvyText className="mb-3 text-center text-zinc-600 dark:text-zinc-400">
          Could not load the player.
        </IvyText>
        <Pressable onPress={openYoutube}>
          <IvyText className="font-semibold text-ivy-accent">
            Open in YouTube
          </IvyText>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="relative overflow-hidden rounded-xl bg-black">
      {!ready ? (
        <View
          className="absolute left-0 right-0 top-0 z-10 items-center justify-center bg-zinc-900"
          style={{ height: 220 }}
        >
          <ActivityIndicator color={IvyColors.accent} size="large" />
        </View>
      ) : null}
      <YoutubePlayer
        key={resolvedId}
        height={220}
        play={false}
        videoId={resolvedId}
        onReady={() => setReady(true)}
        onError={() => setFailed(true)}
        webViewProps={{
          // Let the parent ScrollView handle vertical scroll; otherwise the WebView steals pans.
          scrollEnabled: false,
        }}
      />
    </View>
  );
}
