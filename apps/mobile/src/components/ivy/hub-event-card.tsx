import * as Linking from 'expo-linking';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';

import { AddToCalendarButton } from './add-to-calendar-button';
import { IvyText } from './ivy-text';

export type HubEventListItem = {
  id: string;
  title: string;
  description: string | null;
  format: 'IN_PERSON' | 'ONLINE';
  startsAt: string;
  endsAt: string;
  location: string | null;
  meetingUrl: string | null;
  creatorName: string;
  rsvpCount: number;
  iAmGoing: boolean;
};

type HubEventCardProps = {
  event: HubEventListItem;
  canRsvp: boolean;
  rsvpPending?: boolean;
  onToggleRsvp: () => void;
};

function formatEventWhen(startsAt: string, endsAt: string): string {
  try {
    const s = new Date(startsAt);
    const e = new Date(endsAt);
    const sameDay =
      s.getFullYear() === e.getFullYear() &&
      s.getMonth() === e.getMonth() &&
      s.getDate() === e.getDate();
    const dOpts: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    const tOpts: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
    };
    const dateStr = s.toLocaleString(undefined, dOpts);
    const startT = s.toLocaleString(undefined, tOpts);
    const endT = e.toLocaleString(undefined, tOpts);
    if (sameDay) {
      return `${dateStr} · ${startT} – ${endT}`;
    }
    return `${s.toLocaleString(undefined, { ...dOpts, ...tOpts })} → ${e.toLocaleString(undefined, { ...dOpts, ...tOpts })}`;
  } catch {
    return `${startsAt} – ${endsAt}`;
  }
}

export function HubEventCard({
  event,
  canRsvp,
  rsvpPending,
  onToggleRsvp,
}: HubEventCardProps) {
  const accent = IvyColors.accent;
  const when = formatEventWhen(event.startsAt, event.endsAt);
  const isOnline = event.format === 'ONLINE';

  const openMeeting = () => {
    if (event.meetingUrl) void Linking.openURL(event.meetingUrl);
  };

  return (
    <View className="mb-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <View className="flex-row flex-wrap items-center gap-2">
        <View
          className={`rounded-full px-2.5 py-0.5 ${
            isOnline
              ? 'bg-violet-100 dark:bg-violet-950/60'
              : 'bg-emerald-100 dark:bg-emerald-950/60'
          }`}
        >
          <IvyText
            className={`text-[10px] font-bold uppercase tracking-wider ${
              isOnline
                ? 'text-violet-800 dark:text-violet-200'
                : 'text-emerald-800 dark:text-emerald-200'
            }`}
          >
            {isOnline ? 'Online' : 'In person'}
          </IvyText>
        </View>
        <IvyText className="text-[11px] text-zinc-400 dark:text-zinc-500">
          by {event.creatorName}
        </IvyText>
      </View>

      <IvyText className="mt-2 text-base font-semibold text-zinc-900 dark:text-white">
        {event.title}
      </IvyText>
      <IvyText className="mt-1 text-[13px] leading-5 text-zinc-600 dark:text-zinc-400">
        {when}
      </IvyText>

      {event.description ? (
        <IvyText className="mt-2 text-[14px] leading-5 text-zinc-700 dark:text-zinc-300">
          {event.description}
        </IvyText>
      ) : null}

      {!isOnline && event.location ? (
        <View className="mt-3 flex-row items-start gap-2">
          <IconSymbol name="mappin.and.ellipse" size={18} color={accent} />
          <IvyText className="flex-1 text-[14px] leading-5 text-zinc-700 dark:text-zinc-300">
            {event.location}
          </IvyText>
        </View>
      ) : null}

      {isOnline && event.meetingUrl ? (
        <Pressable
          onPress={openMeeting}
          className="mt-3 flex-row items-center gap-2 self-start rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 active:opacity-80 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <IconSymbol name="video.fill" size={18} color={accent} />
          <IvyText className="text-sm font-semibold text-ivy-accent">
            Open meeting link
          </IvyText>
          <IconSymbol name="link" size={16} color={accent} />
        </Pressable>
      ) : null}

      <View className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <View className="flex-row items-center justify-between gap-3">
          <IvyText className="text-xs text-zinc-500 dark:text-zinc-400">
            {event.rsvpCount === 0
              ? 'No RSVPs yet'
              : event.rsvpCount === 1
                ? '1 person going'
                : `${event.rsvpCount} people going`}
          </IvyText>
          <Pressable
            onPress={onToggleRsvp}
            disabled={!canRsvp || rsvpPending}
            className={`min-w-[100px] flex-row items-center justify-center gap-1.5 rounded-xl px-3 py-2 active:opacity-90 disabled:opacity-40 ${
              event.iAmGoing
                ? 'border border-ivy-accent bg-ivy-accent/10'
                : 'bg-ivy-accent'
            }`}
          >
            {rsvpPending ? (
              <ActivityIndicator
                size="small"
                color={event.iAmGoing ? accent : IvyColors.onAccent}
              />
            ) : (
              <IconSymbol
                name={event.iAmGoing ? 'checkmark.circle.fill' : 'person.fill.checkmark'}
                size={18}
                color={event.iAmGoing ? accent : IvyColors.onAccent}
              />
            )}
            <IvyText
              className={`text-sm font-semibold ${
                event.iAmGoing ? 'text-ivy-accent' : 'text-zinc-900'
              }`}
            >
              {event.iAmGoing ? 'Going' : 'RSVP'}
            </IvyText>
          </Pressable>
        </View>

        {event.iAmGoing ? (
          <View className="mt-3">
            <AddToCalendarButton
              title={event.title}
              startsAt={event.startsAt}
              endsAt={event.endsAt}
              notes={
                event.description
                  ? `${event.description}\n\n${
                      isOnline
                        ? event.meetingUrl
                          ? `Meeting: ${event.meetingUrl}`
                          : ''
                        : event.location
                          ? `Location: ${event.location}`
                          : ''
                    }`
                  : isOnline
                    ? event.meetingUrl ?? undefined
                    : event.location
                      ? `Location: ${event.location}`
                      : undefined
              }
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}
