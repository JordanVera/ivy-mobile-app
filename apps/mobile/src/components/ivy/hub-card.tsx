import { ActivityIndicator, Pressable, View } from 'react-native';

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
}: HubCardProps) {
  return (
    <Pressable
      onPress={onOpen}
      accessibilityLabel={`Open ${name} hub`}
      className="mb-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 active:opacity-90 dark:border-zinc-800 dark:bg-zinc-900"
    >
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

      <View className="mt-4 flex-row items-center gap-2">
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
