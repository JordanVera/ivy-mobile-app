import { type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { GrayscaleCoverImage } from '@/components/ivy/grayscale-cover-image';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';
import { useCountdown } from '@/hooks/use-countdown';
import { trpc } from '@/lib/trpc';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const DEFAULT_HERO_IMAGE: number = require('@/assets/images/ivy-grid.png');

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

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}

type LiveEventHomeCardProps = {
  /** Optional override for the hero backdrop. Defaults to the curated Ivy photo. */
  heroImage?: number | ImageSource;
};

/**
 * Full-bleed, photo-forward hero for the Home screen — editorial in the style
 * of a Vogue cover. Keeps the existing near-realtime countdown + pulsing LIVE
 * indicator, but renders them over a portrait backdrop with a dark gradient
 * scrim instead of the previous white card chrome.
 */
export function LiveEventHomeCard({
  heroImage = DEFAULT_HERO_IMAGE,
}: LiveEventHomeCardProps = {}) {
  const router = useRouter();
  const query = trpc.liveEvent.next.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const event = query.data;
  const status = event?.status;
  const isLive = status === 'live';
  const isUpcoming = !!event && status === 'upcoming';

  const onPress = () => router.push('/live' as Href);

  const press = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [shimmer]);

  useEffect(() => {
    if (!isLive) {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [isLive, pulse]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.985]) }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.1, 0.35]),
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-60, 60]) }],
  }));

  const livePulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.45, 1]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.92, 1.12]) }],
  }));

  const title = event?.title ?? 'Monday Mentoring Moments #MMM';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (press.value = withTiming(1, { duration: 120 }))}
      onPressOut={() => (press.value = withTiming(0, { duration: 160 }))}
      accessibilityRole="button"
      accessibilityLabel={isLive ? 'Join live event' : 'View upcoming event'}
      style={pressStyle}
    >
      <View
        className="w-full overflow-hidden bg-zinc-900"
        style={styles.heroFrame}
      >
        <GrayscaleCoverImage
          source={heroImage}
          contentFit="cover"
          accessible={false}
        />

        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.9)']}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { top: '35%' }]}
          pointerEvents="none"
        />

        <View
          className="absolute inset-0 z-10 justify-between"
          style={styles.contentPadding}
        >
          <View className="flex-row items-start justify-between">
            {isLive ? (
              <View className="flex-row items-center gap-1.5 rounded-sm bg-red-600 px-2.5 py-1">
                <Animated.View
                  style={[
                    {
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#ffffff',
                    },
                    livePulseStyle,
                  ]}
                />
                <IvyText className="text-[10px] font-bold uppercase tracking-[2.5px] text-white">
                  Live Now
                </IvyText>
              </View>
            ) : (
              <View className="flex-row items-center gap-1.5 rounded-sm bg-black/55 px-2.5 py-1">
                <IconSymbol
                  name="dot.radiowaves.left.and.right"
                  size={11}
                  color={IvyColors.accent}
                />
                <IvyText className="text-[10px] font-bold uppercase tracking-[2.5px] text-ivy-accent">
                  {isUpcoming ? 'Up Next · Live' : 'Featured'}
                </IvyText>
              </View>
            )}

            {isUpcoming ? (
              <View className="rounded-sm bg-black/45 px-2.5 py-1">
                <IvyText className="text-[10px] font-medium tracking-wide text-white/90">
                  {formatEventDate(event!.startsAt)}
                </IvyText>
              </View>
            ) : null}
          </View>

          <View>
            <IvyText className="text-[10px] font-semibold uppercase tracking-[3px] text-ivy-accent">
              Monday Mentorship Moment
            </IvyText>
            <IvyHeading
              level="brand"
              className="mt-2 text-[30px] leading-[1.1] text-white"
              numberOfLines={3}
            >
              {title}
            </IvyHeading>

            {isUpcoming ? (
              <View className="mt-5">
                <HeroCountdown target={event!.startsAt} />
              </View>
            ) : isLive ? (
              <View className="mt-4 flex-row items-center gap-3">
                <Animated.View style={livePulseStyle}>
                  <IvyHeading
                    level="brand"
                    className="text-[36px] leading-none text-red-500"
                  >
                    On Air
                  </IvyHeading>
                </Animated.View>
                <IvyText className="flex-1 text-[13px] leading-5 text-white/80">
                  Tap to join the stream now
                </IvyText>
              </View>
            ) : (
              <IvyText className="mt-3 text-[14px] leading-[1.4] text-white/80">
                Start your week with clarity, discipline, and bold leadership.
              </IvyText>
            )}

            <View className="mt-5 flex-row items-center justify-between border-t border-white/20 pt-4">
              <IvyText className="text-[11px] font-semibold uppercase tracking-[2.5px] text-white">
                {isLive ? 'Join Live' : 'View Details'}
              </IvyText>
              <IconSymbol name="chevron.right" size={16} color="#ffffff" />
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

/**
 * Compact editorial countdown rendered over the dark scrim of the hero. White
 * numerals, spring-green micro-labels, with a gentle tick pulse on the seconds so the
 * card feels alive.
 */
function HeroCountdown({ target }: { target: string | Date }) {
  const { days, hours, minutes, seconds, elapsed } = useCountdown(target);
  const tick = useSharedValue(0);

  useEffect(() => {
    tick.value = withSequence(
      withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 240, easing: Easing.in(Easing.quad) }),
    );
  }, [seconds, tick]);

  const tickStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(tick.value, [0, 1], [1, 1.06]) }],
    opacity: interpolate(tick.value, [0, 1], [1, 0.85]),
  }));

  if (elapsed) return null;

  const parts = [
    { value: days, label: days === 1 ? 'day' : 'days' },
    { value: hours, label: 'hrs' },
    { value: minutes, label: 'min' },
    { value: seconds, label: 'sec', animated: true },
  ];

  return (
    <View className="flex-row items-end justify-between">
      {parts.map((p, i) => (
        <View
          key={p.label}
          className="flex-1 flex-row items-end justify-center"
        >
          <View className="items-center">
            {p.animated ? (
              <Animated.View style={tickStyle}>
                <IvyHeading
                  level="brand"
                  className="text-[32px] leading-none tabular-nums text-white"
                >
                  {pad(p.value)}
                </IvyHeading>
              </Animated.View>
            ) : (
              <IvyHeading
                level="brand"
                className="text-[32px] leading-none tabular-nums text-white"
              >
                {pad(p.value)}
              </IvyHeading>
            )}
            <IvyText className="mt-1.5 text-[9px] font-semibold uppercase tracking-[2px] text-ivy-accent">
              {p.label}
            </IvyText>
          </View>
          {i < parts.length - 1 ? (
            <IvyText
              style={{ marginBottom: 14 }}
              className="mx-1 text-xl font-light text-white/30"
            >
              :
            </IvyText>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  heroFrame: {
    width: '100%',
    aspectRatio: 4 / 5,
    position: 'relative',
  },
  shimmerWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  contentPadding: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 22,
  },
});
