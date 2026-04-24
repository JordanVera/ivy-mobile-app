import * as Calendar from 'expo-calendar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';

import { IvyText } from './ivy-text';

type AddToCalendarButtonProps = {
  title: string;
  startsAt: string | Date;
  endsAt: string | Date;
  notes?: string | null;
  /** Optional YouTube video ID — included as a URL in the calendar notes. */
  youtubeVideoId?: string | null;
  /** Optional override for the label. */
  label?: string;
};

const ACCENT = IvyColors.accent;

async function getWritableCalendarId(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT,
  );
  const writable = calendars.filter(
    (c) => c.allowsModifications && c.source?.name,
  );

  if (Platform.OS === 'ios') {
    const defaultCal = await Calendar.getDefaultCalendarAsync().catch(
      () => null,
    );
    if (defaultCal?.id && defaultCal.allowsModifications) {
      return defaultCal.id;
    }
    return writable[0]?.id ?? null;
  }

  // Android: prefer a Google account calendar, then any writable primary.
  const primary =
    writable.find(
      (c) =>
        c.isPrimary &&
        (c.accessLevel === Calendar.CalendarAccessLevel.OWNER ||
          c.accessLevel === Calendar.CalendarAccessLevel.CONTRIBUTOR),
    ) ?? writable[0];
  return primary?.id ?? null;
}

export function AddToCalendarButton({
  title,
  startsAt,
  endsAt,
  notes,
  youtubeVideoId,
  label,
}: AddToCalendarButtonProps) {
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);

  const onPress = useCallback(async () => {
    if (busy || added) return;
    setBusy(true);
    try {
      const perm = await Calendar.requestCalendarPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert(
          'Calendar access needed',
          'Allow Ivy to access your calendar in Settings to save this event.',
        );
        return;
      }

      const calendarId = await getWritableCalendarId();
      if (!calendarId) {
        Alert.alert(
          'No writable calendar',
          'We could not find a calendar to save this event to on your device.',
        );
        return;
      }

      const startDate = startsAt instanceof Date ? startsAt : new Date(startsAt);
      const endDate = endsAt instanceof Date ? endsAt : new Date(endsAt);

      const noteLines: string[] = [];
      if (notes?.trim()) noteLines.push(notes.trim());
      if (youtubeVideoId) {
        noteLines.push(
          `Watch: https://www.youtube.com/watch?v=${youtubeVideoId}`,
        );
      }

      await Calendar.createEventAsync(calendarId, {
        title,
        startDate,
        endDate,
        notes: noteLines.join('\n\n') || undefined,
        alarms: [{ relativeOffset: -15 }],
        url: youtubeVideoId
          ? `https://www.youtube.com/watch?v=${youtubeVideoId}`
          : undefined,
      });

      setAdded(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not save to calendar.';
      Alert.alert('Calendar error', message);
    } finally {
      setBusy(false);
    }
  }, [added, busy, endsAt, notes, startsAt, title, youtubeVideoId]);

  const rendered = added ? 'Added to calendar' : (label ?? 'Add to calendar');
  const iconName = added ? 'checkmark.circle.fill' : 'calendar.badge.plus';

  return (
    <Pressable
      onPress={onPress}
      disabled={busy || added}
      accessibilityLabel={rendered}
      className={`flex-row items-center justify-center gap-2 rounded-xl border px-4 py-3 active:opacity-90 ${
        added
          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40'
          : 'border-ivy-accent/40 bg-ivy-accent/10 dark:border-ivy-accent/40 dark:bg-ivy-accent/15'
      }`}
    >
      {busy ? (
        <ActivityIndicator color={ACCENT} />
      ) : (
        <IconSymbol
          name={iconName}
          size={18}
          color={added ? '#047857' : ACCENT}
        />
      )}
      <IvyText
        className={`text-sm font-semibold ${
          added
            ? 'text-emerald-700 dark:text-emerald-300'
            : 'text-ivy-accent'
        }`}
      >
        {rendered}
      </IvyText>
      {/* Keep layout balanced when not busy */}
      <View />
    </Pressable>
  );
}
