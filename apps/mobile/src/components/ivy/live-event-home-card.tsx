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

import { GoldGradientButton } from '@/components/ivy/gold-gradient-button';
import { IvyCard } from '@/components/ivy/ivy-card';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useCountdown } from '@/hooks/use-countdown';
import { trpc } from '@/lib/trpc';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

/**
 * Hero card for the Home screen. Full-width, countdown-forward layout with a
 * subtle animated gold shimmer, a pulsing LIVE indicator when on-air, and a
 * gentle per-second tick on the countdown to keep the card feeling alive.
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
    opacity: interpolate(shimmer.value, [0, 1], [0.35, 0.75]),
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-40, 40]) }],
  }));

  const livePulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.35, 1]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.9, 1.15]) }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (press.value = withTiming(1, { duration: 120 }))}
      onPressOut={() => (press.value = withTiming(0, { duration: 160 }))}
      accessibilityRole="button"
      style={pressStyle}
    >
      <IvyCard className="mb-6 overflow-hidden p-0">
        <LinearGradient
          colors={['rgba(180, 83, 9, 0.08)', 'rgba(245, 158, 11, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.shimmerWrap, shimmerStyle]}
        >
          <LinearGradient
            colors={[
              'rgba(245, 158, 11, 0)',
              'rgba(245, 158, 11, 0.18)',
              'rgba(245, 158, 11, 0)',
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        <View className="px-5 pb-5 pt-5">
          <View className="flex-row items-center justify-between">
            {isLive ? (
              <View className="flex-row items-center gap-1.5 self-start rounded-full bg-red-600 px-2.5 py-1">
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
                <IvyText className="text-[10px] font-bold uppercase tracking-widest text-white">
                  Live Now
                </IvyText>
              </View>
            ) : (
              <View className="flex-row items-center gap-1.5 self-start rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1">
                <IconSymbol
                  name="dot.radiowaves.left.and.right"
                  size={11}
                  color="#b45309"
                />
                <IvyText className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  {isUpcoming ? 'Up Next · Live' : 'Featured'}
                </IvyText>
              </View>
            )}

            {isUpcoming ? (
              <IvyText className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {formatEventDate(event!.startsAt)}
              </IvyText>
            ) : null}
          </View>

          <IvyHeading className="mt-3 text-2xl leading-tight text-zinc-900 dark:text-white">
            {event?.title ?? 'Monday Mentorship Moment'}
          </IvyHeading>

          {isUpcoming ? (
            <View className="mt-5">
              <HeroCountdown target={event!.startsAt} />
            </View>
          ) : isLive ? (
            <View className="mt-5 items-center">
              <Animated.View style={livePulseStyle}>
                <IvyHeading className="text-5xl font-bold tracking-tight text-red-600">
                  ON AIR
                </IvyHeading>
              </Animated.View>
              <IvyText className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Tap to join the live stream right now.
              </IvyText>
            </View>
          ) : (
            <IvyText className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Start your week with clarity, discipline, and bold leadership.
            </IvyText>
          )}

          <View className="mt-5">
            <GoldGradientButton
              title={isLive ? 'Join Live' : 'See Details'}
              onPress={onPress}
            />
          </View>
        </View>
      </IvyCard>
    </AnimatedPressable>
  );
}

/** Large, center-aligned countdown with a subtle tick animation on seconds. */
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
    transform: [{ scale: interpolate(tick.value, [0, 1], [1, 1.08]) }],
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
                <IvyText className="text-4xl font-bold tabular-nums text-zinc-900 dark:text-white">
                  {pad(p.value)}
                </IvyText>
              </Animated.View>
            ) : (
              <IvyText className="text-4xl font-bold tabular-nums text-zinc-900 dark:text-white">
                {pad(p.value)}
              </IvyText>
            )}
            <IvyText className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              {p.label}
            </IvyText>
          </View>
          {i < parts.length - 1 ? (
            <IvyText
              style={{ marginBottom: 14 }}
              className="mx-1 text-2xl font-light text-zinc-300 dark:text-zinc-700"
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
  shimmerWrap: {
    ...StyleSheet.absoluteFillObject,
  },
});
