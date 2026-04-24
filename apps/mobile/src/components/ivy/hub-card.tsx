import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';

import { IvyText } from './ivy-text';

export type HubCardProps = {
  name: string;
  tagline?: string | null;
  icon: IconSymbolName;
  memberCount: number;
  joined: boolean;
  joinPending?: boolean;
  onOpen: () => void;
  onToggleJoin: () => void;
  imageUrl?: string;
  gradient?: readonly [string, string, ...string[]];
};

function formatMemberCount(n: number): string {
  if (n === 1) return '1 member';
  return `${n} members`;
}

export function HubCard({
  name,
  tagline,
  icon,
  memberCount,
  joined,
  joinPending,
  onOpen,
  onToggleJoin,
  imageUrl,
  gradient,
}: HubCardProps) {
  const hasVisuals = imageUrl && gradient;

  return (
    <Pressable
      onPress={onOpen}
      accessibilityLabel={`Open ${name} hub`}
      className="mb-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white active:opacity-95 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {hasVisuals ? (
        <View style={styles.heroFrame}>
          <Image
            source={{ uri: imageUrl }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            contentPosition="center"
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
          <LinearGradient
            colors={[
              'rgba(0,0,0,0.05)',
              'rgba(0,0,0,0.30)',
              'rgba(0,0,0,0.75)',
            ]}
            locations={[0, 0.4, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />

          <View className="absolute bottom-0 left-0 right-0 p-4">
            <View className="mb-1 flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                <IconSymbol name={icon} size={20} color="#ffffff" />
              </View>
              {joined ? (
                <View className="rounded-full border border-ivy-accent/60 bg-ivy-accent/25 px-2 py-0.5">
                  <IvyText className="text-[9px] font-bold uppercase tracking-wider text-ivy-accent">
                    Joined
                  </IvyText>
                </View>
              ) : null}
            </View>
            <IvyText className="text-xl font-semibold text-white">
              {name}
            </IvyText>
            {tagline ? (
              <IvyText
                className="mt-0.5 text-[13px] leading-5 text-white/90"
                numberOfLines={2}
              >
                {tagline}
              </IvyText>
            ) : null}
            <IvyText className="mt-1.5 text-[11px] font-medium text-white/70">
              {formatMemberCount(memberCount)}
            </IvyText>
          </View>
        </View>
      ) : (
        <View className="p-4">
          <View className="flex-row items-start gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-ivy-accent/15 dark:bg-ivy-accent/25">
              <IconSymbol name={icon} size={26} color={IvyColors.accent} />
            </View>

            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-2">
                <IvyText
                  className="shrink text-base font-semibold text-zinc-900 dark:text-white"
                  numberOfLines={1}
                >
                  {name}
                </IvyText>
                {joined ? (
                  <View className="rounded-full border border-ivy-accent/40 bg-ivy-accent/10 px-2 py-0.5">
                    <IvyText className="text-[10px] font-semibold uppercase tracking-wider text-ivy-accent">
                      Joined
                    </IvyText>
                  </View>
                ) : null}
              </View>

              {tagline ? (
                <IvyText
                  className="mt-1 text-sm leading-5 text-zinc-600 dark:text-zinc-400"
                  numberOfLines={2}
                >
                  {tagline}
                </IvyText>
              ) : null}

              <IvyText className="mt-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                {formatMemberCount(memberCount)}
              </IvyText>
            </View>
          </View>
        </View>
      )}

      <View className="flex-row items-center gap-2 px-4 pb-4 pt-3">
        <Pressable
          onPress={onToggleJoin}
          disabled={joinPending}
          accessibilityLabel={joined ? `Leave ${name}` : `Join ${name}`}
          className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 active:opacity-90 disabled:opacity-50 ${
            joined
              ? 'border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
              : 'bg-ivy-accent'
          }`}
        >
          {joinPending ? (
            <ActivityIndicator
              size="small"
              color={joined ? IvyColors.accent : IvyColors.onAccent}
            />
          ) : (
            <IconSymbol
              name={joined ? 'checkmark.circle.fill' : 'plus.circle.fill'}
              size={18}
              color={joined ? IvyColors.accent : IvyColors.onAccent}
            />
          )}
          <IvyText
            className={`text-sm font-semibold ${
              joined ? 'text-ivy-accent' : 'text-zinc-900'
            }`}
          >
            {joined ? 'Joined' : 'Join hub'}
          </IvyText>
        </Pressable>

        <Pressable
          onPress={onOpen}
          className="flex-row items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 active:opacity-90 dark:border-zinc-700 dark:bg-zinc-900"
          accessibilityLabel={`Open ${name} chat`}
        >
          <IconSymbol
            name="bubble.left.and.bubble.right.fill"
            size={18}
            color={IvyColors.accent}
          />
          <IvyText className="text-sm font-semibold text-ivy-accent">
            Chat
          </IvyText>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroFrame: {
    width: '100%',
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
});
