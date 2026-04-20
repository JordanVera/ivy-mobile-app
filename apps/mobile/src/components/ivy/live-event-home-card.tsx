import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { GoldGradientButton } from '@/components/ivy/gold-gradient-button';
import { IvyCard } from '@/components/ivy/ivy-card';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { LiveCountdown } from '@/components/ivy/live-countdown';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';

const ivyHero = require('@/assets/images/ivy-3.jpeg');

function formatEventDate(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  } catch {
    return iso;
  }
}

/**
 * Hero card for the Home screen. Upgrades the previous static "Monday Mentorship Moment"
 * tile into a live-aware card: shows a countdown while upcoming, a pulsing "LIVE NOW"
 * indicator when live, and falls back to a static card if nothing is scheduled.
 */
export function LiveEventHomeCard() {
  const router = useRouter();
  const query = trpc.liveEvent.next.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const event = query.data;
  const status = event?.status;
  const isLive = status === 'live';

  // Typed-routes regenerates on `expo start` to include '/live'; cast covers the gap.
  const onPress = () => router.push('/live' as Href);

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <IvyCard className="mb-6 overflow-hidden p-0">
        <View className="min-h-[220px] flex-row items-stretch">
          <View className="flex-1 justify-center px-4 py-5">
            {isLive ? (
              <View className="mb-1 flex-row items-center gap-1.5 self-start rounded-full bg-red-600 px-2.5 py-1">
                <View className="h-1.5 w-1.5 rounded-full bg-white" />
                <IvyText className="text-[10px] font-bold uppercase tracking-widest text-white">
                  Live Now
                </IvyText>
              </View>
            ) : (
              <IvyText className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                {status === 'upcoming' ? 'Up Next · Live' : 'Featured'}
              </IvyText>
            )}

            <IvyHeading className="mt-1 text-2xl leading-tight text-zinc-900 dark:text-white">
              {event?.title ?? 'Monday Mentorship Moment'}
            </IvyHeading>

            {event && status === 'upcoming' ? (
              <>
                <IvyText className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatEventDate(event.startsAt)}
                </IvyText>
                <View className="mt-3">
                  <LiveCountdown target={event.startsAt} size="compact" />
                </View>
              </>
            ) : (
              <IvyText className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {isLive
                  ? 'Tap to join the live stream right now.'
                  : 'Start your week with clarity, discipline, and bold leadership.'}
              </IvyText>
            )}

            <View className="mt-4 self-start">
              <GoldGradientButton
                title={isLive ? 'Join Live' : 'See Details'}
                onPress={onPress}
              />
            </View>
          </View>

          <View
            className="bg-zinc-200 dark:bg-zinc-800"
            style={styles.heroImageFrame}
          >
            <Image
              source={ivyHero}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              contentPosition="top"
            />
            <View pointerEvents="none" style={styles.imageDarkOverlay} />
            {isLive ? (
              <View
                pointerEvents="none"
                className="absolute left-2 top-2 flex-row items-center gap-1 rounded-full bg-red-600 px-2 py-0.5"
              >
                <IconSymbol
                  name="dot.radiowaves.left.and.right"
                  size={12}
                  color="#ffffff"
                />
                <IvyText className="text-[10px] font-bold uppercase tracking-wider text-white">
                  Live
                </IvyText>
              </View>
            ) : null}
          </View>
        </View>
      </IvyCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imageDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  heroImageFrame: {
    width: '42%',
    minWidth: 130,
    minHeight: 220,
    alignSelf: 'stretch',
    position: 'relative',
    overflow: 'hidden',
  },
});
