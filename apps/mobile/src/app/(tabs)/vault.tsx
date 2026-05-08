import {
  ExchangeComposer,
  type EditTarget,
  type ReplyTarget,
} from '@/components/ivy/exchange-composer';
import { ExchangeMessageRow } from '@/components/ivy/exchange-message-row';
import { IvyText } from '@/components/ivy/ivy-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@clerk/expo';
import { useIsFocused } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
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

const POLL_INTERVAL_MS = 4000;
const ACCENT = IvyColors.accent;

export default function ExchangeScreen() {
  const { isSignedIn } = useAuth();
  const isFocused = useIsFocused();
  const utils = trpc.useUtils();
  const scrollRef = useRef<ScrollView>(null);

  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  const messagesQuery = trpc.exchange.messages.useQuery(undefined, {
    refetchInterval: isFocused ? POLL_INTERVAL_MS : false,
    refetchOnWindowFocus: true,
  });

  // ── Send ────────────────────────────────────────────────────────────────────
  const sendMessage = trpc.exchange.sendMessage.useMutation({
    onMutate: async ({ body, replyToId }) => {
      await utils.exchange.messages.cancel();
      const previous = utils.exchange.messages.getData();
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
      utils.exchange.messages.setData(undefined, (prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, optimistic] }
          : { messages: [optimistic] },
      );
      return { previous };
    },
    onError: (err, _input, context) => {
      if (context?.previous)
        utils.exchange.messages.setData(undefined, context.previous);
      Alert.alert('Could not send message', err.message);
    },
    onSettled: () => void utils.exchange.messages.invalidate(),
  });

  // ── Edit ────────────────────────────────────────────────────────────────────
  const editMessage = trpc.exchange.editMessage.useMutation({
    onMutate: async ({ messageId, body }) => {
      await utils.exchange.messages.cancel();
      const previous = utils.exchange.messages.getData();
      utils.exchange.messages.setData(undefined, (prev) => {
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
      if (context?.previous)
        utils.exchange.messages.setData(undefined, context.previous);
      Alert.alert('Could not edit message', err.message);
    },
    onSettled: () => void utils.exchange.messages.invalidate(),
  });

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteMessage = trpc.exchange.deleteMessage.useMutation({
    onMutate: async ({ messageId }) => {
      await utils.exchange.messages.cancel();
      const previous = utils.exchange.messages.getData();
      utils.exchange.messages.setData(undefined, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter((m) => m.id !== messageId),
        };
      });
      return { previous };
    },
    onError: (err, _input, context) => {
      if (context?.previous)
        utils.exchange.messages.setData(undefined, context.previous);
      Alert.alert('Could not delete message', err.message);
    },
    onSettled: () => void utils.exchange.messages.invalidate(),
  });

  // ── Like ────────────────────────────────────────────────────────────────────
  const toggleReaction = trpc.exchange.toggleReaction.useMutation({
    onMutate: async ({ messageId }) => {
      await utils.exchange.messages.cancel();
      const previous = utils.exchange.messages.getData();
      utils.exchange.messages.setData(undefined, (prev) => {
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
      if (context?.previous)
        utils.exchange.messages.setData(undefined, context.previous);
    },
    onSettled: () => void utils.exchange.messages.invalidate(),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (body: string, replyToId?: string) => {
      setReplyTo(null);
      await sendMessage.mutateAsync({ body, replyToId }).catch(() => undefined);
      requestAnimationFrame(() =>
        scrollRef.current?.scrollToEnd({ animated: true }),
      );
    },
    [sendMessage],
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

  const composerDisabledReason = useMemo<string | null>(() => {
    if (!isSignedIn) return 'Sign in to chat in The Exchange.';
    return null;
  }, [isSignedIn]);

  const messages = messagesQuery.data?.messages ?? [];

  return (
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
        <View className="flex-row items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-900">
          <View className="flex-1">
            <IvyText className="text-base font-semibold uppercase tracking-widest text-zinc-900 dark:text-white">
              The Exchange
            </IvyText>
            <IvyText className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Every Tuesday · Open chat
            </IvyText>
          </View>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-ivy-accent/15">
            <IconSymbol name="arrow.2.squarepath" size={16} color={ACCENT} />
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
                          Alert.alert(
                            'Sign in',
                            'You need to sign in to like messages.',
                          );
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
        <View className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
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
  );
}
