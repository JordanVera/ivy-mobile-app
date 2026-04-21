import { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { IvyText } from './ivy-text';

const MAX_LENGTH = 2000;

export type EpisodeCommentComposerProps = {
  /** Disables the input entirely (e.g. signed-out state) with a hint instead. */
  disabledReason?: string | null;
  /** Fired with a trimmed body. Parent handles the mutation + optimistic update. */
  onSubmit: (body: string) => void | Promise<void>;
  /** Show a spinner and lock out the submit button. */
  submitting?: boolean;
};

export function EpisodeCommentComposer({
  disabledReason,
  onSubmit,
  submitting,
}: EpisodeCommentComposerProps) {
  const [draft, setDraft] = useState('');

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
    setDraft('');
    await onSubmit(body);
  };

  return (
    <View className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <TextInput
        className="min-h-[72px] rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[15px] leading-6 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        placeholder="Share a takeaway or question…"
        placeholderTextColor="#a1a1aa"
        value={draft}
        onChangeText={setDraft}
        multiline
        maxLength={MAX_LENGTH}
        textAlignVertical="top"
        editable={!submitting}
      />
      <View className="mt-2 flex-row items-center justify-end gap-3">
        <IvyText className="text-xs text-zinc-400 dark:text-zinc-500">
          {draft.length}/{MAX_LENGTH}
        </IvyText>
        <Pressable
          accessibilityLabel="Post comment"
          disabled={!canSend}
          onPress={handleSend}
          className="min-w-[72px] flex-row items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 active:opacity-90 disabled:opacity-40"
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <IvyText className="text-sm font-semibold text-white">Post</IvyText>
          )}
        </Pressable>
      </View>
    </View>
  );
}
