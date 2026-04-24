import { useAuth } from '@clerk/expo';
import { useIsFocused } from '@react-navigation/native';
import {
  Stack,
  useLocalSearchParams,
  useRouter,
  type Href,
} from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EpisodeCommentComposer } from '@/components/ivy/episode-comment-composer';
import { HubMessageRow } from '@/components/ivy/hub-message-row';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';
import { trpc } from '@/lib/trpc';

const ACCENT = IvyColors.accent;
const ON_ACCENT = IvyColors.onAccent;
/** Mirrors the episode discussion screen — near-realtime polling cadence. */
const POLL_INTERVAL_MS = 4000;

const FALLBACK_ICON: IconSymbolName = 'person.3.fill';
const KNOWN_ICONS: ReadonlySet<IconSymbolName> = new Set([
  'briefcase.fill',
  'graduationcap.fill',
  'sun.max.fill',
  'figure.stand',
  'person.3.fill',
  'bubble.left.and.bubble.right.fill',
  'map.fill',
  'mountain.2.fill',
]);

function resolveIcon(icon: string | null | undefined): IconSymbolName {
  if (icon && KNOWN_ICONS.has(icon as IconSymbolName)) {
    return icon as IconSymbolName;
  }
  return FALLBACK_ICON;
}

function formatMemberCount(n: number): string {
  if (n === 1) return '1 member';
  return `${n.toLocaleString()} members`;
}

type ActionPillProps = {
  icon: IconSymbolName;
  label: string;
  onPress: () => void;
  variant?: 'default' | 'accent';
  disabled?: boolean;
  loading?: boolean;
};

function ActionPill({
  icon,
  label,
  onPress,
  variant = 'default',
  disabled,
  loading,
}: ActionPillProps) {
  const isAccent = variant === 'accent';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={label}
      className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-2 active:opacity-90 disabled:opacity-50 ${
        isAccent
          ? 'bg-ivy-accent'
          : 'border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
      }`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isAccent ? ON_ACCENT : ACCENT}
        />
      ) : (
        <IconSymbol
          name={icon}
          size={16}
          color={isAccent ? ON_ACCENT : ACCENT}
        />
      )}
      <IvyText
        className={`text-[12px] font-semibold ${
          isAccent ? 'text-zinc-900' : 'text-ivy-accent'
        }`}
      >
        {label}
      </IvyText>
    </Pressable>
  );
}

export default function HubScreen() {
  const { slug: slugParam } = useLocalSearchParams<{ slug: string }>();
  const slug = (Array.isArray(slugParam) ? slugParam[0] : slugParam)?.trim();

  const router = useRouter();
  const isFocused = useIsFocused();
  const { isSignedIn } = useAuth();
  const utils = trpc.useUtils();
  const scrollRef = useRef<ScrollView>(null);

  const hubQuery = trpc.hubs.get.useQuery(
    { slug: slug ?? '' },
    { enabled: !!slug },
  );

  const messagesQuery = trpc.hubs.messages.useQuery(
    { slug: slug ?? '' },
    {
      enabled: !!slug,
      refetchInterval: isFocused ? POLL_INTERVAL_MS : false,
      refetchOnWindowFocus: true,
    },
  );

  const join = trpc.hubs.join.useMutation({
    onSuccess: () => {
      if (slug) void utils.hubs.get.invalidate({ slug });
      void utils.hubs.list.invalidate();
    },
  });
  const leave = trpc.hubs.leave.useMutation({
    onSuccess: () => {
      if (slug) void utils.hubs.get.invalidate({ slug });
      void utils.hubs.list.invalidate();
    },
  });

  const sendMessage = trpc.hubs.sendMessage.useMutation({
    onMutate: async ({ body }) => {
      if (!slug) return;
      await utils.hubs.messages.cancel({ slug });
      const previous = utils.hubs.messages.getData({ slug });
      const tempId = `optimistic-${Date.now()}`;
      const optimistic = {
        id: tempId,
        authorId: 'me',
        name: 'You',
        authorImageUrl: null,
        time: 'just now',
        createdAt: new Date().toISOString(),
        body,
        mine: true,
      };
      utils.hubs.messages.setData({ slug }, (prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, optimistic] }
          : { slug, messages: [optimistic] },
      );
      return { previous };
    },
    onError: (err, _input, context) => {
      if (!slug) return;
      if (context?.previous) {
        utils.hubs.messages.setData({ slug }, context.previous);
      }
      Alert.alert('Could not send message', err.message);
    },
    onSettled: () => {
      if (!slug) return;
      void utils.hubs.messages.invalidate({ slug });
      if (slug) void utils.hubs.get.invalidate({ slug });
    },
  });

  const handleSubmit = useCallback(
    async (body: string) => {
      if (!slug) return;
      await sendMessage.mutateAsync({ slug, body }).catch(() => undefined);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    },
    [sendMessage, slug],
  );

  const handleToggleJoin = useCallback(() => {
    if (!slug) return;
    if (!isSignedIn) {
      router.push('/login' as Href);
      return;
    }
    if (hubQuery.data?.joined) {
      leave.mutate({ slug });
    } else {
      join.mutate({ slug });
    }
  }, [slug, isSignedIn, hubQuery.data?.joined, join, leave, router]);

  const handleNotifications = useCallback(() => {
    Alert.alert(
      'Coming soon',
      'Notifications for hub activity are on the way.',
    );
  }, []);

  const handlePlanEvent = useCallback(() => {
    Alert.alert(
      'Coming soon',
      'Hub event planning will land in a future update.',
    );
  }, []);

  const composerDisabledReason = useMemo<string | null>(() => {
    if (!isSignedIn) return 'Sign in to chat in this hub.';
    return null;
  }, [isSignedIn]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/community' as Href);
  };

  if (!slug) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View className="flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
          <IvyText className="text-center text-zinc-700 dark:text-zinc-300">
            Missing hub.
          </IvyText>
        </View>
      </SafeAreaView>
    );
  }

  const hub = hubQuery.data;
  const messages = messagesQuery.data?.messages ?? [];
  const messageCount = messages.length;
  const messageLabel =
    messageCount === 0
      ? 'Be the first to share'
      : messageCount === 1
        ? '1 message'
        : `${messageCount} messages`;

  const joined = hub?.joined ?? false;
  const joinPending = join.isPending || leave.isPending;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={{ flex: 1 }}
        edges={['top', 'left', 'right']}
        className="bg-zinc-50 dark:bg-zinc-950"
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <View className="flex-row items-center justify-between border-b border-zinc-200 px-2 py-2 dark:border-zinc-900">
            <Pressable
              onPress={goBack}
              hitSlop={12}
              accessibilityLabel="Back"
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <IconSymbol name="chevron.left" size={24} color={ACCENT} />
            </Pressable>
            <IvyText
              className="flex-1 text-center text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white"
              numberOfLines={1}
            >
              {hub?.name ?? 'Hub'}
            </IvyText>
            <View className="h-10 w-10" />
          </View>

          <View className="flex-1">
            <ScrollView
              ref={scrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="px-5 pt-6">
                <View className="items-center">
                  <View className="h-14 w-14 items-center justify-center rounded-2xl bg-ivy-accent/15 dark:bg-ivy-accent/25">
                    <IconSymbol
                      name={resolveIcon(hub?.icon)}
                      size={28}
                      color={ACCENT}
                    />
                  </View>
                  <IvyHeading
                    level="brand"
                    className="mt-4 text-center text-[26px] leading-[1.2] text-zinc-900 dark:text-white"
                  >
                    {hub?.name ?? '…'}
                  </IvyHeading>
                  {hub?.tagline ? (
                    <IvyText className="mt-1 text-center text-[14px] italic leading-5 text-zinc-600 dark:text-zinc-400">
                      {hub.tagline}
                    </IvyText>
                  ) : null}
                  {hub ? (
                    <IvyText className="mt-2 text-[12px] font-medium text-zinc-500 dark:text-zinc-500">
                      {formatMemberCount(hub.memberCount)}
                    </IvyText>
                  ) : null}
                  {hub?.description ? (
                    <IvyText className="mt-3 max-w-[320px] text-center text-[13px] leading-5 text-zinc-600 dark:text-zinc-400">
                      {hub.description}
                    </IvyText>
                  ) : null}
                </View>

                <View className="mt-5 flex-row flex-wrap items-center justify-center gap-2">
                  <ActionPill
                    icon={
                      joined ? 'checkmark.circle.fill' : 'plus.circle.fill'
                    }
                    label={joined ? 'Joined' : 'Join hub'}
                    variant={joined ? 'default' : 'accent'}
                    loading={joinPending}
                    onPress={handleToggleJoin}
                  />
                  <ActionPill
                    icon="bell.fill"
                    label="Turn on notifications"
                    onPress={handleNotifications}
                  />
                  <ActionPill
                    icon="calendar.badge.plus"
                    label="Plan an event"
                    onPress={handlePlanEvent}
                  />
                </View>
              </View>

              <View className="mx-5 mt-8 border-t border-zinc-200 dark:border-zinc-800" />

              <View className="mx-5 mt-6 flex-row items-center justify-between">
                <IvyText className="text-[10px] font-semibold uppercase tracking-[3px] text-zinc-500 dark:text-zinc-400">
                  Hub Chat
                </IvyText>
                <View className="flex-row items-center gap-1.5">
                  {messagesQuery.isFetching && !messagesQuery.isLoading ? (
                    <ActivityIndicator size="small" color={ACCENT} />
                  ) : null}
                  <IvyText className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {messageLabel}
                  </IvyText>
                </View>
              </View>

              <View className="mx-5 mt-2">
                {messagesQuery.isLoading ? (
                  <View className="items-center py-10">
                    <ActivityIndicator color={ACCENT} />
                  </View>
                ) : messagesQuery.isError ? (
                  <View className="py-6">
                    <IvyText className="text-sm text-red-600 dark:text-red-400">
                      {messagesQuery.error.message}
                    </IvyText>
                    <Pressable
                      onPress={() => void messagesQuery.refetch()}
                      className="mt-3 self-start rounded-full border border-zinc-300 px-4 py-2 dark:border-zinc-700"
                    >
                      <IvyText className="text-[11px] font-semibold uppercase tracking-[2px] text-zinc-900 dark:text-white">
                        Retry
                      </IvyText>
                    </Pressable>
                  </View>
                ) : messages.length === 0 ? (
                  <View className="items-center py-10">
                    <IconSymbol
                      name="bubble.left.and.bubble.right.fill"
                      size={26}
                      color="#a1a1aa"
                    />
                    <IvyText className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      No messages yet. Start the conversation.
                    </IvyText>
                  </View>
                ) : (
                  messages.map((m, idx) => {
                    const prev = idx > 0 ? messages[idx - 1] : null;
                    const compact =
                      prev != null &&
                      prev.authorId === m.authorId &&
                      !m.id.startsWith('optimistic-') &&
                      !prev.id.startsWith('optimistic-');
                    const variant = m.id.startsWith('optimistic-')
                      ? 'pending'
                      : m.mine
                        ? 'mine'
                        : 'default';
                    return (
                      <HubMessageRow
                        key={m.id}
                        name={m.name}
                        time={m.time}
                        body={m.body}
                        authorImageUrl={m.authorImageUrl}
                        variant={variant}
                        compact={compact}
                      />
                    );
                  })
                )}
              </View>

              <View className="mx-5 mt-6">
                <EpisodeCommentComposer
                  disabledReason={composerDisabledReason}
                  onSubmit={handleSubmit}
                  submitting={sendMessage.isPending}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
