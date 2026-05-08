import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';

import { IvyText } from './ivy-text';

const MAX_LENGTH = 2000;

export type ReplyTarget = {
  id: string;
  name: string;
  body: string;
};

export type EditTarget = {
  id: string;
  body: string;
};

export type ExchangeComposerProps = {
  disabledReason?: string | null;
  /** Called when sending a new message or confirming a reply. */
  onSubmit: (body: string, replyToId?: string) => void | Promise<void>;
  /** Called when saving an edited message. */
  onSaveEdit: (messageId: string, body: string) => void | Promise<void>;
  submitting?: boolean;
  replyTo?: ReplyTarget | null;
  onCancelReply?: () => void;
  editTarget?: EditTarget | null;
  onCancelEdit?: () => void;
};

export function ExchangeComposer({
  disabledReason,
  onSubmit,
  onSaveEdit,
  submitting,
  replyTo,
  onCancelReply,
  editTarget,
  onCancelEdit,
}: ExchangeComposerProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<TextInput>(null);
  const isEditing = !!editTarget;

  // Pre-fill draft when entering edit mode, clear when leaving
  useEffect(() => {
    if (editTarget) {
      setDraft(editTarget.body);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setDraft('');
    }
  }, [editTarget?.id]);

  if (disabledReason) {
    return (
      <View className="rounded-2xl border border-zinc-200 bg-zinc-100/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
        <IvyText className="text-sm text-zinc-600 dark:text-zinc-400">
          {disabledReason}
        </IvyText>
      </View>
    );
  }

  const trimmed = draft.trim();
  const canSend = trimmed.length > 0 && !submitting;

  const handleSend = async () => {
    if (!canSend) return;
    const body = trimmed;
    if (isEditing && editTarget) {
      await onSaveEdit(editTarget.id, body);
    } else {
      setDraft('');
      await onSubmit(body, replyTo?.id);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      onCancelEdit?.();
    } else {
      onCancelReply?.();
    }
  };

  return (
    <View className="gap-1">
      {/* Edit mode strip */}
      {isEditing ? (
        <View className="flex-row items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-100 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800">
          <IconSymbol name="square.and.arrow.up" size={13} color="#71717a" />
          <IvyText className="flex-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            Editing message
          </IvyText>
          <Pressable onPress={handleCancel} hitSlop={12} accessibilityLabel="Cancel edit">
            <IconSymbol name="xmark" size={14} color="#a1a1aa" />
          </Pressable>
        </View>
      ) : replyTo ? (
        /* Reply strip */
        <View className="flex-row items-center gap-2 rounded-xl border border-ivy-accent/30 bg-ivy-accent/8 px-3 py-2 dark:bg-ivy-accent/10">
          <View className="w-0.5 self-stretch rounded-full bg-ivy-accent" />
          <View className="flex-1">
            <IvyText className="text-[11px] font-semibold text-ivy-accent">
              Replying to {replyTo.name}
            </IvyText>
            <IvyText
              className="mt-0.5 text-[12px] text-zinc-500 dark:text-zinc-400"
              numberOfLines={1}
            >
              {replyTo.body}
            </IvyText>
          </View>
          <Pressable onPress={handleCancel} hitSlop={12} accessibilityLabel="Cancel reply">
            <IconSymbol name="xmark" size={14} color="#a1a1aa" />
          </Pressable>
        </View>
      ) : null}

      {/* Input row */}
      <View className="flex-row items-end gap-2">
        <TextInput
          ref={inputRef}
          className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[15px] leading-5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          placeholder="Message…"
          placeholderTextColor="#a1a1aa"
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={MAX_LENGTH}
          textAlignVertical="top"
          editable={!submitting}
        />
        <Pressable
          accessibilityLabel={isEditing ? 'Save edit' : 'Send message'}
          disabled={!canSend}
          onPress={handleSend}
          className={`h-10 w-10 items-center justify-center rounded-full active:opacity-80 disabled:opacity-35 ${
            isEditing ? 'bg-zinc-700 dark:bg-zinc-300' : 'bg-ivy-accent'
          }`}
        >
          {submitting ? (
            <ActivityIndicator color={IvyColors.onAccent} size="small" />
          ) : isEditing ? (
            <IconSymbol name="checkmark.circle.fill" size={18} color={isEditing ? '#ffffff' : IvyColors.onAccent} />
          ) : (
            <IconSymbol name="paperplane.fill" size={16} color={IvyColors.onAccent} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
