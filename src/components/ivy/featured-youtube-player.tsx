import * as Linking from 'expo-linking';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

import { YOUTUBE_PLACEHOLDER_VIDEO_ID } from '@/constants/youtube';

import { IvyText } from './ivy-text';

export function FeaturedYoutubePlayer() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const watchUrl = `https://www.youtube.com/watch?v=${YOUTUBE_PLACEHOLDER_VIDEO_ID}`;

  const openYoutube = useCallback(() => {
    void Linking.openURL(watchUrl);
  }, [watchUrl]);

  if (Platform.OS === 'web') {
    return (
      <View className="aspect-video w-full items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800">
        <Pressable
          onPress={openYoutube}
          className="rounded-xl bg-amber-600 px-4 py-3 active:opacity-90 dark:bg-amber-500">
          <IvyText className="font-semibold text-white">Open placeholder video (web)</IvyText>
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
          <IvyText className="font-semibold text-amber-600 dark:text-amber-400">Open in YouTube</IvyText>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="relative overflow-hidden rounded-xl bg-black">
      {!ready ? (
        <View
          className="absolute left-0 right-0 top-0 z-10 items-center justify-center bg-zinc-900"
          style={{ height: 220 }}>
          <ActivityIndicator color="#fbbf24" size="large" />
        </View>
      ) : null}
      <YoutubePlayer
        height={220}
        play={false}
        videoId={YOUTUBE_PLACEHOLDER_VIDEO_ID}
        onReady={() => setReady(true)}
        onError={() => setFailed(true)}
      />
    </View>
  );
}
