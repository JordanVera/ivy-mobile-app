import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';
import { trpc } from '@/lib/trpc';

import { IvyText } from './ivy-text';

const IS_WEB = Platform.OS === 'web';

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDatePart(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toTimePart(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function defaultStartEnd(): { start: Date; end: Date } {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { start, end };
}

function combineLocalToIso(dateStr: string, timeStr: string): string | null {
  const dp = dateStr
    .trim()
    .split('-')
    .map((x) => Number(x));
  const tp = timeStr
    .trim()
    .split(':')
    .map((x) => Number(x));
  if (dp.length !== 3 || tp.length < 2) return null;
  const [y, m, day] = dp;
  const [hh, mm] = tp;
  if (
    !y ||
    !m ||
    !day ||
    Number.isNaN(hh) ||
    Number.isNaN(mm) ||
    hh < 0 ||
    hh > 23 ||
    mm < 0 ||
    mm > 59
  ) {
    return null;
  }
  return new Date(y, m - 1, day, hh, mm, 0, 0).toISOString();
}

function applyDatePart(base: Date, picked: Date): Date {
  return new Date(
    picked.getFullYear(),
    picked.getMonth(),
    picked.getDate(),
    base.getHours(),
    base.getMinutes(),
    0,
    0,
  );
}

function applyTimePart(base: Date, picked: Date): Date {
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    picked.getHours(),
    picked.getMinutes(),
    0,
    0,
  );
}

function afterStartChange(newStart: Date, end: Date): [Date, Date] {
  if (end.getTime() <= newStart.getTime()) {
    return [newStart, new Date(newStart.getTime() + 60 * 60 * 1000)];
  }
  return [newStart, end];
}

function afterStartDateChange(newStart: Date, end: Date): [Date, Date] {
  // Copy the new start date to end, keeping end's time
  const newEnd = new Date(
    newStart.getFullYear(),
    newStart.getMonth(),
    newStart.getDate(),
    end.getHours(),
    end.getMinutes(),
    0,
    0,
  );
  // Ensure end is still after start
  if (newEnd.getTime() <= newStart.getTime()) {
    return [newStart, new Date(newStart.getTime() + 60 * 60 * 1000)];
  }
  return [newStart, newEnd];
}

function afterEndChange(start: Date, newEnd: Date): Date {
  if (newEnd.getTime() <= start.getTime()) {
    return new Date(start.getTime() + 60 * 60 * 1000);
  }
  return newEnd;
}

function formatPickerDate(d: Date): string {
  try {
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return toDatePart(d);
  }
}

function formatPickerTime(d: Date): string {
  try {
    return d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return toTimePart(d);
  }
}

type IosPickerOpen = {
  target: 'start' | 'end';
  mode: 'date' | 'time';
};

type HubPlanEventModalProps = {
  visible: boolean;
  hubSlug: string;
  onClose: () => void;
};

export function HubPlanEventModal({
  visible,
  hubSlug,
  onClose,
}: HubPlanEventModalProps) {
  const insets = useSafeAreaInsets();
  const utils = trpc.useUtils();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState<'IN_PERSON' | 'ONLINE'>('IN_PERSON');
  const [location, setLocation] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');

  const [startsAt, setStartsAt] = useState(() => defaultStartEnd().start);
  const [endsAt, setEndsAt] = useState(() => defaultStartEnd().end);

  const [wStartDate, setWStartDate] = useState('');
  const [wStartTime, setWStartTime] = useState('');
  const [wEndDate, setWEndDate] = useState('');
  const [wEndTime, setWEndTime] = useState('');

  const [iosPicker, setIosPicker] = useState<IosPickerOpen | null>(null);

  const createEvent = trpc.hubs.createEvent.useMutation({
    onSuccess: async () => {
      await utils.hubs.events.invalidate({ slug: hubSlug });
      onClose();
      setTitle('');
      setDescription('');
      setLocation('');
      setMeetingUrl('');
      const { start, end } = defaultStartEnd();
      setStartsAt(start);
      setEndsAt(end);
      setWStartDate(toDatePart(start));
      setWStartTime(toTimePart(start));
      setWEndDate(toDatePart(end));
      setWEndTime(toTimePart(end));
      setIosPicker(null);
    },
  });

  useEffect(() => {
    if (!visible) return;
    const { start, end } = defaultStartEnd();
    setStartsAt(start);
    setEndsAt(end);
    setWStartDate(toDatePart(start));
    setWStartTime(toTimePart(start));
    setWEndDate(toDatePart(end));
    setWEndTime(toTimePart(end));
    setIosPicker(null);
  }, [visible]);

  const accent = IvyColors.accent;
  const onAccent = IvyColors.onAccent;

  const canSubmit = useMemo(() => {
    if (!title.trim() || createEvent.isPending) return false;
    if (IS_WEB) {
      const s = combineLocalToIso(wStartDate, wStartTime);
      const e = combineLocalToIso(wEndDate, wEndTime);
      if (!s || !e) return false;
      if (new Date(e).getTime() <= new Date(s).getTime()) return false;
    } else {
      if (endsAt.getTime() <= startsAt.getTime()) return false;
    }
    if (format === 'IN_PERSON' && !location.trim()) return false;
    if (format === 'ONLINE' && !meetingUrl.trim()) return false;
    return true;
  }, [
    title,
    startsAt,
    endsAt,
    wStartDate,
    wStartTime,
    wEndDate,
    wEndTime,
    format,
    location,
    meetingUrl,
    createEvent.isPending,
  ]);

  const openAndroidPicker = (
    mode: 'date' | 'time',
    value: Date,
    onPick: (picked: Date) => void,
  ) => {
    DateTimePickerAndroid.open({
      value,
      mode,
      is24Hour: false,
      onChange: (event: DateTimePickerEvent, date?: Date) => {
        if (event.type !== 'set' || date == null) return;
        onPick(date);
      },
    });
  };

  const handleNativeDatePress = (target: 'start' | 'end') => {
    const base = target === 'start' ? startsAt : endsAt;
    if (Platform.OS === 'android') {
      openAndroidPicker('date', base, (picked) => {
        const merged = applyDatePart(base, picked);
        if (target === 'start') {
          const [s, e] = afterStartDateChange(merged, endsAt);
          setStartsAt(s);
          setEndsAt(e);
        } else {
          setEndsAt(afterEndChange(startsAt, merged));
        }
      });
    } else {
      setIosPicker({ target, mode: 'date' });
    }
  };

  const handleNativeTimePress = (target: 'start' | 'end') => {
    const base = target === 'start' ? startsAt : endsAt;
    if (Platform.OS === 'android') {
      openAndroidPicker('time', base, (picked) => {
        const merged = applyTimePart(base, picked);
        if (target === 'start') {
          const [s, e] = afterStartChange(merged, endsAt);
          setStartsAt(s);
          setEndsAt(e);
        } else {
          setEndsAt(afterEndChange(startsAt, merged));
        }
      });
    } else {
      setIosPicker({ target, mode: 'time' });
    }
  };

  const onIosPickerChange = (_: DateTimePickerEvent, picked?: Date) => {
    if (!iosPicker || picked == null) return;
    const base = iosPicker.target === 'start' ? startsAt : endsAt;
    const merged =
      iosPicker.mode === 'date'
        ? applyDatePart(base, picked)
        : applyTimePart(base, picked);
    if (iosPicker.target === 'start') {
      // Use different logic for date vs time changes
      const [s, e] =
        iosPicker.mode === 'date'
          ? afterStartDateChange(merged, endsAt)
          : afterStartChange(merged, endsAt);
      setStartsAt(s);
      setEndsAt(e);
    } else {
      setEndsAt(afterEndChange(startsAt, merged));
    }
  };

  const iosPickerValue =
    iosPicker == null
      ? startsAt
      : iosPicker.target === 'start'
        ? startsAt
        : endsAt;

  const onSubmit = () => {
    if (!canSubmit) return;
    const desc = description.trim();
    let startD: Date;
    let endD: Date;
    if (IS_WEB) {
      const s = combineLocalToIso(wStartDate, wStartTime)!;
      const e = combineLocalToIso(wEndDate, wEndTime)!;
      startD = new Date(s);
      endD = new Date(e);
    } else {
      startD = startsAt;
      endD = endsAt;
    }
    createEvent.mutate({
      slug: hubSlug,
      title: title.trim(),
      description: desc.length ? desc : null,
      format,
      startsAt: startD,
      endsAt: endD,
      location: format === 'IN_PERSON' ? location.trim() : null,
      meetingUrl: format === 'ONLINE' ? meetingUrl.trim() : null,
    });
  };

  function DateTimePickerRow({
    label,
    target,
  }: {
    label: string;
    target: 'start' | 'end';
  }) {
    const d = target === 'start' ? startsAt : endsAt;
    return (
      <>
        <IvyText className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {label}
        </IvyText>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => handleNativeDatePress(target)}
            className="min-h-[48px] flex-1 flex-row items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 active:opacity-90 dark:border-zinc-700 dark:bg-zinc-900"
            accessibilityLabel={`${label} date`}
          >
            <IconSymbol name="calendar.badge.plus" size={20} color={accent} />
            <IvyText
              className="flex-1 text-[15px] text-zinc-900 dark:text-zinc-100"
              numberOfLines={2}
            >
              {formatPickerDate(d)}
            </IvyText>
          </Pressable>
          <Pressable
            onPress={() => handleNativeTimePress(target)}
            className="min-h-[48px] w-[124px] flex-row items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-2 py-2.5 active:opacity-90 dark:border-zinc-700 dark:bg-zinc-900"
            accessibilityLabel={`${label} time`}
          >
            <IvyText className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
              {formatPickerTime(d)}
            </IvyText>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-zinc-50 dark:bg-zinc-950"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          className="flex-row items-center justify-between border-b border-zinc-200 px-3 dark:border-zinc-900"
          style={{ paddingTop: Math.max(insets.top, 12), paddingBottom: 12 }}
        >
          <Pressable
            onPress={onClose}
            hitSlop={12}
            className="h-10 w-10 items-center justify-center rounded-full"
            accessibilityLabel="Close"
          >
            <IconSymbol name="xmark" size={22} color={accent} />
          </Pressable>
          <IvyText className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
            Plan an event
          </IvyText>
          <View className="h-10 w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <IvyText className="mt-4 text-[13px] leading-5 text-zinc-600 dark:text-zinc-400">
            Add a time, place or meeting link, and your hub can RSVP to commit
            to showing up.
          </IvyText>

          <IvyText className="mb-1.5 mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Title
          </IvyText>
          <TextInput
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[15px] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="Coffee meetup, study night…"
            placeholderTextColor="#a1a1aa"
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />

          <IvyText className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Description (optional)
          </IvyText>
          <TextInput
            className="min-h-[72px] rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[15px] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="What to bring, what to expect…"
            placeholderTextColor="#a1a1aa"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={2000}
            textAlignVertical="top"
          />

          <IvyText className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Format
          </IvyText>
          <View className="flex-row gap-2">
            {(
              [
                { key: 'IN_PERSON' as const, label: 'In person' },
                { key: 'ONLINE' as const, label: 'Online' },
              ] as const
            ).map((opt) => {
              const selected = format === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setFormat(opt.key)}
                  className={`flex-1 rounded-xl border px-3 py-3 ${
                    selected
                      ? 'border-ivy-accent bg-ivy-accent/15'
                      : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
                  }`}
                >
                  <IvyText
                    className={`text-center text-sm font-semibold ${
                      selected
                        ? 'text-ivy-accent'
                        : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {opt.label}
                  </IvyText>
                </Pressable>
              );
            })}
          </View>

          {IS_WEB ? (
            <>
              <IvyText className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Starts
              </IvyText>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[15px] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#a1a1aa"
                  value={wStartDate}
                  onChangeText={setWStartDate}
                  autoCapitalize="none"
                />
                <TextInput
                  className="w-[108px] rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[15px] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="HH:MM"
                  placeholderTextColor="#a1a1aa"
                  value={wStartTime}
                  onChangeText={setWStartTime}
                  autoCapitalize="none"
                />
              </View>
              <IvyText className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Ends
              </IvyText>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[15px] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#a1a1aa"
                  value={wEndDate}
                  onChangeText={setWEndDate}
                  autoCapitalize="none"
                />
                <TextInput
                  className="w-[108px] rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[15px] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="HH:MM"
                  placeholderTextColor="#a1a1aa"
                  value={wEndTime}
                  onChangeText={setWEndTime}
                  autoCapitalize="none"
                />
              </View>
            </>
          ) : (
            <>
              <DateTimePickerRow label="Starts" target="start" />
              <DateTimePickerRow label="Ends" target="end" />
            </>
          )}

          {format === 'IN_PERSON' ? (
            <>
              <IvyText className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Location
              </IvyText>
              <TextInput
                className="min-h-[72px] rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[15px] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="Address or venue name"
                placeholderTextColor="#a1a1aa"
                value={location}
                onChangeText={setLocation}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
            </>
          ) : (
            <>
              <IvyText className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Meeting link
              </IvyText>
              <TextInput
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[15px] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder="https://zoom.us/… or https://meet.google.com/…"
                placeholderTextColor="#a1a1aa"
                value={meetingUrl}
                onChangeText={setMeetingUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </>
          )}

          {createEvent.isError ? (
            <IvyText className="mt-4 text-sm text-red-600 dark:text-red-400">
              {createEvent.error.message}
            </IvyText>
          ) : null}

          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit}
            className="mt-8 flex-row items-center justify-center gap-2 rounded-2xl bg-ivy-accent py-3.5 active:opacity-90 disabled:opacity-40"
          >
            {createEvent.isPending ? (
              <ActivityIndicator color={onAccent} />
            ) : (
              <IconSymbol
                name="calendar.badge.plus"
                size={22}
                color={onAccent}
              />
            )}
            <IvyText className="text-base font-semibold text-zinc-900">
              Create event
            </IvyText>
          </Pressable>
        </ScrollView>

        {Platform.OS === 'ios' && iosPicker ? (
          <View
            className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            style={{ paddingBottom: insets.bottom }}
          >
            <View className="flex-row items-center justify-end border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
              <Pressable
                onPress={() => setIosPicker(null)}
                hitSlop={8}
                className="rounded-lg px-3 py-1.5"
              >
                <IvyText className="text-[15px] font-semibold text-ivy-accent">
                  Done
                </IvyText>
              </Pressable>
            </View>
            <View style={{ height: 216 }}>
              <DateTimePicker
                value={iosPickerValue}
                mode={iosPicker.mode}
                display="spinner"
                onChange={onIosPickerChange}
              />
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}
