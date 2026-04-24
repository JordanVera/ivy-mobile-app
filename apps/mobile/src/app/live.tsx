import * as Linking from 'expo-linking';
import { Stack, useRouter, type Href } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddToCalendarButton } from '@/components/ivy/add-to-calendar-button';
import { FeaturedYoutubePlayer } from '@/components/ivy/featured-youtube-player';
import { GoldGradientButton } from '@/components/ivy/gold-gradient-button';
import { IvyCard } from '@/components/ivy/ivy-card';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { LiveCountdown } from '@/components/ivy/live-countdown';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';
import { trpc } from '@/lib/trpc';

const ACCENT = IvyColors.accent;

function formatLongDate(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(d);
  } catch {
    return iso;
  }
}

export default function LiveEventScreen() {
  const router = useRouter();
  const query = trpc.liveEvent.next.useQuery(undefined, {
    staleTime: 30_000,
  });

  const event = query.data;
  const isLive = event?.status === 'live';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={{ flex: 1 }}
        edges={['top', 'left', 'right']}
        className="bg-zinc-50 dark:bg-zinc-950"
      >
        <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
          <View className="flex-row items-center justify-between px-4 py-2">
            <Pressable
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/home' as Href);
              }}
              hitSlop={12}
              accessibilityLabel="Back"
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <IconSymbol name="chevron.left" size={24} color={ACCENT} />
            </Pressable>
            <IvyText className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
              Live Hub
            </IvyText>
            <View className="h-10 w-10" />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 36 }}
            showsVerticalScrollIndicator={false}
          >
            {query.isLoading ? (
              <View className="items-center py-16">
                <ActivityIndicator color={ACCENT} size="large" />
              </View>
            ) : query.isError ? (
              <IvyCard className="mt-6">
                <IvyText className="text-sm text-red-600 dark:text-red-400">
                  {query.error.message}
                </IvyText>
                <Pressable
                  onPress={() => void query.refetch()}
                  className="mt-3 self-start rounded-xl bg-zinc-100 px-4 py-2 dark:bg-zinc-800"
                >
                  <IvyText className="text-sm font-medium text-zinc-900 dark:text-white">
                    Try again
                  </IvyText>
                </Pressable>
              </IvyCard>
            ) : !event ? (
              <IvyCard className="mt-6">
                <IvyText className="text-xs font-semibold uppercase tracking-wider text-ivy-accent">
                  Nothing scheduled
                </IvyText>
                <IvyHeading className="mt-1 text-xl text-zinc-900 dark:text-white">
                  The next Monday Mentorship Moment isn’t on the calendar yet.
                </IvyHeading>
                <IvyText className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Check back soon — new live sessions drop every month.
                </IvyText>
              </IvyCard>
            ) : (
              <>
                <View className="mt-4 items-center">
                  {isLive ? (
                    <View className="flex-row items-center gap-2 self-center rounded-full bg-red-600 px-3 py-1.5">
                      <View className="h-2 w-2 rounded-full bg-white" />
                      <IvyText className="text-[11px] font-bold uppercase tracking-widest text-white">
                        Live Now
                      </IvyText>
                    </View>
                  ) : (
                    <IvyText className="text-xs font-semibold uppercase tracking-widest text-ivy-accent">
                      Next Live Session
                    </IvyText>
                  )}
                  <IvyHeading
                    level="title"
                    className="mt-3 text-center text-3xl leading-tight text-zinc-900 dark:text-white"
                  >
                    {event.title}
                  </IvyHeading>
                  <IvyText className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    {formatLongDate(event.startsAt)}
                  </IvyText>
                </View>

                {isLive ? (
                  <View className="mt-6">
                    <FeaturedYoutubePlayer videoId={event.youtubeVideoId} />
                    <GoldGradientButton
                      title="Open in YouTube"
                      onPress={() =>
                        void Linking.openURL(
                          `https://www.youtube.com/watch?v=${event.youtubeVideoId}`,
                        )
                      }
                    />
                  </View>
                ) : (
                  <IvyCard className="mt-6 items-center py-8">
                    <IvyText className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      Starts in
                    </IvyText>
                    <LiveCountdown target={event.startsAt} size="large" />
                  </IvyCard>
                )}

                {event.description ? (
                  <IvyCard className="mt-4">
                    <IvyText className="text-[15px] leading-6 text-zinc-700 dark:text-zinc-300">
                      {event.description}
                    </IvyText>
                  </IvyCard>
                ) : null}

                <View className="mt-4 gap-3">
                  {!isLive ? (
                    <AddToCalendarButton
                      title={event.title}
                      startsAt={event.startsAt}
                      endsAt={event.endsAt}
                      notes={event.description}
                      youtubeVideoId={event.youtubeVideoId}
                    />
                  ) : null}

                  <Pressable
                    onPress={() =>
                      void Linking.openURL(
                        `https://www.youtube.com/watch?v=${event.youtubeVideoId}`,
                      )
                    }
                    className="flex-row items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 active:opacity-90 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <IconSymbol
                      name="play.rectangle.fill"
                      size={18}
                      color={ACCENT}
                    />
                    <IvyText className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Watch on YouTube
                    </IvyText>
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}
