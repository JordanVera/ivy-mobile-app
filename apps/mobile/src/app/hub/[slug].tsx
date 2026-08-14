import { useAuth } from '@clerk/expo';
import { useIsFocused } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ExchangeComposer,
  type EditTarget,
  type ReplyTarget,
} from '@/components/ivy/exchange-composer';
import { ExchangeMessageRow } from '@/components/ivy/exchange-message-row';
import { HubMemberRow } from '@/components/ivy/hub-member-row';
import { IvyText } from '@/components/ivy/ivy-text';
import { useToast } from '@/components/ivy/toast-provider';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';
import { trpc } from '@/lib/trpc';

const ACCENT = IvyColors.accent;
const POLL_INTERVAL_MS = 4000;

export default function HubScreen() {
  const { slug: slugParam } = useLocalSearchParams<{ slug: string }>();
  const slug = (Array.isArray(slugParam) ? slugParam[0] : slugParam)?.trim();

  const router = useRouter();
  const isFocused = useIsFocused();
  const { isSignedIn } = useAuth();
  const utils = trpc.useUtils();
  const toast = useToast();
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);

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

  const membersQuery = trpc.hubs.members.useQuery(
    { slug: slug ?? '' },
    { enabled: !!slug && showMembers },
  );

  // ── Send ────────────────────────────────────────────────────────────────────
  const sendMessage = trpc.hubs.sendMessage.useMutation({
    onMutate: async ({ body, replyToId }) => {
      if (!slug) return;
      await utils.hubs.messages.cancel({ slug });
      const previous = utils.hubs.messages.getData({ slug });
      const wasNotJoined = !hubQuery.data?.joined;
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        authorId: 'me',
        name: 'You',
        authorImageUrl: null,
        time: 'just now',
        createdAt: new Date().toISOString(),
        body,
        editedAt: null,
        mine: true,
        likeCount: 0,
        likedByMe: false,
        replyTo: replyTo
          ? { id: replyTo.id, name: replyTo.name, body: replyTo.body }
          : null,
      };
      utils.hubs.messages.setData({ slug }, (prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, optimistic] }
          : { slug, messages: [optimistic] },
      );
      return { previous, wasNotJoined };
    },
    onError: (err, _input, context) => {
      if (!slug) return;
      if (context?.previous) {
        utils.hubs.messages.setData({ slug }, context.previous);
      }
      Alert.alert('Could not send message', err.message);
    },
    onSettled: (_data, _error, _variables, context) => {
      if (!slug) return;
      void utils.hubs.messages.invalidate({ slug });
      void utils.hubs.get.invalidate({ slug });
      void utils.hubs.list.invalidate();
      if (context?.wasNotJoined && hubQuery.data?.name) {
        toast.showSuccess(`You joined ${hubQuery.data.name}!`);
      }
    },
  });

  // ── Edit ────────────────────────────────────────────────────────────────────
  const editMessage = trpc.hubs.editMessage.useMutation({
    onMutate: async ({ messageId, body }) => {
      if (!slug) return;
      await utils.hubs.messages.cancel({ slug });
      const previous = utils.hubs.messages.getData({ slug });
      utils.hubs.messages.setData({ slug }, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === messageId
              ? { ...m, body, editedAt: new Date().toISOString() }
              : m,
          ),
        };
      });
      return { previous };
    },
    onError: (err, _input, context) => {
      if (!slug || !context?.previous) return;
      utils.hubs.messages.setData({ slug }, context.previous);
      Alert.alert('Could not edit message', err.message);
    },
    onSettled: () => { if (slug) void utils.hubs.messages.invalidate({ slug }); },
  });

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteMessage = trpc.hubs.deleteMessage.useMutation({
    onMutate: async ({ messageId }) => {
      if (!slug) return;
      await utils.hubs.messages.cancel({ slug });
      const previous = utils.hubs.messages.getData({ slug });
      utils.hubs.messages.setData({ slug }, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter((m) => m.id !== messageId),
        };
      });
      return { previous };
    },
    onError: (err, _input, context) => {
      if (!slug || !context?.previous) return;
      utils.hubs.messages.setData({ slug }, context.previous);
      Alert.alert('Could not delete message', err.message);
    },
    onSettled: () => { if (slug) void utils.hubs.messages.invalidate({ slug }); },
  });

  // ── Like ────────────────────────────────────────────────────────────────────
  const toggleReaction = trpc.hubs.toggleReaction.useMutation({
    onMutate: async ({ messageId }) => {
      if (!slug) return;
      await utils.hubs.messages.cancel({ slug });
      const previous = utils.hubs.messages.getData({ slug });
      utils.hubs.messages.setData({ slug }, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  likedByMe: !m.likedByMe,
                  likeCount: m.likedByMe ? m.likeCount - 1 : m.likeCount + 1,
                }
              : m,
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (!slug || !context?.previous) return;
      utils.hubs.messages.setData({ slug }, context.previous);
    },
    onSettled: () => { if (slug) void utils.hubs.messages.invalidate({ slug }); },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (body: string, replyToId?: string) => {
      if (!slug) return;
      setReplyTo(null);
      await sendMessage.mutateAsync({ slug, body, replyToId }).catch(() => undefined);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    },
    [sendMessage, slug],
  );

  const handleSaveEdit = useCallback(
    async (messageId: string, body: string) => {
      setEditTarget(null);
      await editMessage.mutateAsync({ messageId, body }).catch(() => undefined);
    },
    [editMessage],
  );

  const handleDeleteConfirm = useCallback(
    (messageId: string) => {
      Alert.alert(
        'Delete message',
        'This will permanently remove your message. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteMessage.mutate({ messageId }),
          },
        ],
      );
    },
    [deleteMessage],
  );

  const handleNotifications = useCallback(() => {
    Alert.alert('Coming soon', 'Notifications for hub activity are on the way.');
  }, []);

  const composerDisabledReason = useMemo<string | null>(() => {
    if (!isSignedIn) return 'Sign in to chat in this hub.';
    return null;
  }, [isSignedIn]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/nest' as Href);
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
          {/* Header */}
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
            <View className="flex-row items-center">
              <Pressable
                onPress={() => setShowMembers(true)}
                hitSlop={12}
                accessibilityLabel="View members"
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <IconSymbol name="person.2.fill" size={20} color={ACCENT} />
              </Pressable>
              <Pressable
                onPress={handleNotifications}
                hitSlop={12}
                accessibilityLabel="Turn on notifications"
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <IconSymbol name="bell.fill" size={20} color={ACCENT} />
              </Pressable>
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => setActiveMessageId(null)}
          >
            <Pressable onPress={() => setActiveMessageId(null)}>
              <View className="mx-5 mt-4">
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
                      <ExchangeMessageRow
                        key={m.id}
                        id={m.id}
                        name={m.name}
                        time={m.time}
                        body={m.body}
                        authorImageUrl={m.authorImageUrl}
                        variant={variant}
                        compact={compact}
                        likeCount={m.likeCount}
                        likedByMe={m.likedByMe}
                        editedAt={m.editedAt}
                        replyTo={m.replyTo}
                        isActive={activeMessageId === m.id}
                        onActivate={() => setActiveMessageId(m.id)}
                        onDeactivate={() => setActiveMessageId(null)}
                        onLike={() => {
                          if (!isSignedIn) {
                            Alert.alert('Sign in', 'You need to sign in to like messages.');
                            return;
                          }
                          toggleReaction.mutate({ messageId: m.id });
                        }}
                        onReply={() => {
                          setEditTarget(null);
                          setReplyTo({ id: m.id, name: m.name, body: m.body });
                        }}
                        onEdit={() => {
                          setReplyTo(null);
                          setEditTarget({ id: m.id, body: m.body });
                        }}
                        onDelete={() => handleDeleteConfirm(m.id)}
                      />
                    );
                  })
                )}
              </View>
            </Pressable>
          </ScrollView>

          {/* Composer */}
          <View
            style={{ paddingBottom: insets.bottom }}
            className="border-t border-zinc-200 bg-zinc-50 px-4 pt-3 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <ExchangeComposer
              disabledReason={composerDisabledReason}
              onSubmit={handleSubmit}
              onSaveEdit={handleSaveEdit}
              submitting={sendMessage.isPending || editMessage.isPending}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              editTarget={editTarget}
              onCancelEdit={() => setEditTarget(null)}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {/* Members sheet */}
      <Modal
        visible={showMembers}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMembers(false)}
      >
        <SafeAreaView
          style={{ flex: 1 }}
          edges={['top', 'left', 'right']}
          className="bg-zinc-50 dark:bg-zinc-950"
        >
          {/* Sheet header */}
          <View className="flex-row items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <IvyText className="text-base font-semibold text-zinc-900 dark:text-white">
              {hub?.memberCount != null
                ? `${hub.memberCount} ${hub.memberCount === 1 ? 'Member' : 'Members'}`
                : 'Members'}
            </IvyText>
            <Pressable
              onPress={() => setShowMembers(false)}
              hitSlop={12}
              accessibilityLabel="Close members"
              className="h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800"
            >
              <IconSymbol name="xmark" size={16} color={ACCENT} />
            </Pressable>
          </View>

          {/* Member list */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {membersQuery.isLoading ? (
              <View className="items-center py-12">
                <ActivityIndicator color={ACCENT} />
              </View>
            ) : membersQuery.isError ? (
              <View className="px-5 py-8">
                <IvyText className="text-sm text-red-600 dark:text-red-400">
                  {membersQuery.error.message}
                </IvyText>
                <Pressable
                  onPress={() => void membersQuery.refetch()}
                  className="mt-3 self-start rounded-full border border-zinc-300 px-4 py-2 dark:border-zinc-700"
                >
                  <IvyText className="text-[11px] font-semibold uppercase tracking-[2px] text-zinc-900 dark:text-white">
                    Retry
                  </IvyText>
                </Pressable>
              </View>
            ) : !membersQuery.data?.length ? (
              <View className="items-center py-12">
                <IconSymbol
                  name="person.2.fill"
                  size={28}
                  color="#a1a1aa"
                />
                <IvyText className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No members yet.
                </IvyText>
              </View>
            ) : (
              membersQuery.data.map((member, idx) => (
                <View key={member.userId}>
                  {idx > 0 && (
                    <View className="mx-5 border-b border-zinc-100 dark:border-zinc-800" />
                  )}
                  <HubMemberRow
                    name={member.name}
                    email={member.email}
                    imageUrl={member.imageUrl}
                    joinedAppAt={member.joinedAppAt}
                    joinedHubAt={member.joinedHubAt}
                  />
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
