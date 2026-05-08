import { useAuth, useClerk, useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { GoldGradientButton } from '@/components/ivy/gold-gradient-button';
import { IvyCard } from '@/components/ivy/ivy-card';
import { IvyText } from '@/components/ivy/ivy-text';
import {
  MembershipSection,
  type BillingPlan,
} from '@/components/ivy/membership-section';
import { ScreenHeader } from '@/components/ivy/screen-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';
import {
  getThemePreference,
  setThemePreference,
  type ThemePreference,
} from '@/lib/theme-preference';
import { trpc } from '@/lib/trpc';

const THEME_OPTIONS: { key: ThemePreference; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];

function shortId(id: string, head = 14): string {
  if (id.length <= head) return id;
  return `${id.slice(0, head)}…`;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function clerkCreatedAtIso(
  user: { createdAt?: Date | number | null } | null | undefined,
): string | null {
  if (!user) return null;
  const raw = user.createdAt;
  if (raw instanceof Date) return raw.toISOString();
  if (typeof raw === 'number') return new Date(raw).toISOString();
  return null;
}

type SettingsRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

function SettingsRow({ label, value, isLast }: SettingsRowProps) {
  return (
    <View
      className={`flex-row items-start justify-between gap-3 py-3.5 ${
        !isLast ? 'border-b border-zinc-100 dark:border-zinc-800/80' : ''
      }`}
    >
      <IvyText className="shrink-0 pt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
        {label}
      </IvyText>
      <IvyText
        className="max-w-[62%] text-right text-sm font-medium leading-5 text-zinc-900 dark:text-zinc-100"
        selectable
      >
        {value}
      </IvyText>
    </View>
  );
}

function SectionLabel({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <IvyText
      className={`mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ${className ?? 'mt-8'}`}
    >
      {children}
    </IvyText>
  );
}

export default function ProfileScreen() {
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { hasAdaptiveThemes } = useUniwind();
  const [storedPref, setStoredPref] = useState<ThemePreference>('light');

  const utils = trpc.useUtils();
  const meQuery = trpc.user.me.useQuery(undefined, {
    enabled: isSignedIn && userLoaded,
  });
  const refreshFromClerk = trpc.user.refreshFromClerk.useMutation({
    onSuccess: () => {
      void utils.user.me.invalidate();
    },
  });

  const plansQuery = trpc.billing.plans.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const subscriptionQuery = trpc.billing.mySubscription.useQuery(undefined, {
    enabled: isSignedIn && userLoaded,
  });

  const activePlanSlugs = subscriptionQuery.data?.activePlanSlugs ?? [];

  useEffect(() => {
    void getThemePreference().then(setStoredPref);
  }, []);

  const onPickTheme = useCallback(async (pref: ThemePreference) => {
    setStoredPref(pref);
    await setThemePreference(pref);
  }, []);

  const onSignOut = useCallback(async () => {
    await signOut();
    router.replace('/login');
  }, [signOut]);

  const displayName = useMemo(() => {
    if (user?.fullName?.trim()) return user.fullName.trim();
    const combined = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(' ');
    if (combined.trim()) return combined.trim();
    if (meQuery.data?.firstName || meQuery.data?.lastName) {
      return (
        [meQuery.data.firstName, meQuery.data.lastName]
          .filter(Boolean)
          .join(' ') || 'Member'
      );
    }
    return (
      meQuery.data?.email ?? user?.primaryEmailAddress?.emailAddress ?? 'Member'
    );
  }, [user, meQuery.data]);

  const avatarUrl = user?.imageUrl ?? meQuery.data?.imageUrl ?? null;
  const email =
    user?.primaryEmailAddress?.emailAddress ?? meQuery.data?.email ?? '—';
  const emailVerified =
    user?.primaryEmailAddress?.verification?.status === 'verified';
  const clerkCreated = clerkCreatedAtIso(user);

  const accent = IvyColors.accent;
  const muted = '#a1a1aa';

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ flex: 1 }}>
        <ScreenHeader title="Settings" />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 36 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center pt-6 pb-2">
            <View className="mb-3 h-[88px] w-[88px] overflow-hidden rounded-full border-2 border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  accessibilityLabel="Profile photo"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <IconSymbol
                    name="person.crop.circle.fill"
                    size={48}
                    color={muted}
                  />
                </View>
              )}
            </View>
            <IvyText className="text-center text-xl font-semibold text-zinc-900 dark:text-white">
              {displayName}
            </IvyText>
            <View className="mt-1 flex-row flex-wrap items-center justify-center gap-1.5">
              <IvyText className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                {email}
              </IvyText>
              {emailVerified ? (
                <IconSymbol
                  name="checkmark.shield.fill"
                  size={16}
                  color={accent}
                />
              ) : null}
            </View>
            {user?.username ? (
              <IvyText className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                @{user.username}
              </IvyText>
            ) : null}
          </View>

          {/* <SectionLabel className="mt-6">Activity</SectionLabel>
          <IvyCard className="mb-0 px-4 py-1">
            {meQuery.isLoading ? (
              <View className="items-center py-6">
                <ActivityIndicator color={accent} />
              </View>
            ) : meQuery.isError ? (
              <View className="py-4">
                <IvyText className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                  Could not load your Ivy stats. Pull to refresh or try again
                  later.
                </IvyText>
                <Pressable
                  onPress={() => void meQuery.refetch()}
                  className="mt-3 self-center rounded-xl bg-zinc-100 px-4 py-2 dark:bg-zinc-800"
                >
                  <IvyText className="text-sm font-medium text-zinc-900 dark:text-white">
                    Retry
                  </IvyText>
                </Pressable>
              </View>
            ) : meQuery.data ? (
              <View className="flex-row py-4">
                {(
                  [
                    { label: 'Posts', value: meQuery.data.counts.posts },
                    { label: 'Likes', value: meQuery.data.counts.likesGiven },
                    { label: 'Comments', value: meQuery.data.counts.comments },
                  ] as const
                ).map((item, i) => (
                  <View
                    key={item.label}
                    className={`flex-1 items-center ${i > 0 ? 'border-l border-zinc-100 dark:border-zinc-800' : ''}`}
                  >
                    <IvyText className="text-2xl font-semibold tabular-nums text-ivy-accent">
                      {item.value}
                    </IvyText>
                    <IvyText className="mt-0.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {item.label}
                    </IvyText>
                  </View>
                ))}
              </View>
            ) : null}
          </IvyCard> */}

          {/* <SectionLabel>Ivy account</SectionLabel>
          <IvyCard className="px-4 py-1">
            {meQuery.data ? (
              <>
                <SettingsRow
                  label="Member since"
                  value={formatDate(meQuery.data.createdAt)}
                />
                <SettingsRow
                  label="Synced profile"
                  value={formatDate(meQuery.data.updatedAt)}
                />
                <SettingsRow
                  label="Member ID"
                  value={shortId(meQuery.data.id, 18)}
                  isLast
                />
              </>
            ) : (
              <IvyText className="py-3 text-sm text-zinc-500 dark:text-zinc-400">
                Sign in to see your Ivy account details.
              </IvyText>
            )}
          </IvyCard> */}

          {/* <SectionLabel>Clerk</SectionLabel>
          <IvyCard className="px-4 py-1">
            <SettingsRow
              label="Clerk user ID"
              value={user?.id ? shortId(user.id, 16) : '—'}
            />
            <SettingsRow
              label="Account created"
              value={clerkCreated ? formatDate(clerkCreated) : '—'}
            />
            <SettingsRow label="Auth provider" value="Clerk" isLast />
          </IvyCard> */}

          <SectionLabel>Membership</SectionLabel>
          <MembershipSection
            plans={(plansQuery.data ?? []) as BillingPlan[]}
            activePlanSlugs={activePlanSlugs}
            isLoadingPlans={plansQuery.isLoading}
            isLoadingSub={subscriptionQuery.isLoading}
            isErrorPlans={plansQuery.isError}
            refetchPlans={() => void plansQuery.refetch()}
          />

          <SectionLabel>Account</SectionLabel>
          <Pressable
            onPress={() => {
              if (refreshFromClerk.isPending) return;
              refreshFromClerk.mutate();
            }}
            disabled={refreshFromClerk.isPending}
            className="mb-6 flex-row items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 active:opacity-90 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-ivy-accent/15 dark:bg-ivy-accent/20">
                <IconSymbol name="arrow.clockwise" size={22} color={accent} />
              </View>
              <View>
                <IvyText className="text-base font-medium text-zinc-900 dark:text-white">
                  Sync from Clerk
                </IvyText>
                <IvyText className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Update name, email, and photo in database
                </IvyText>
              </View>
            </View>
            {refreshFromClerk.isPending ? (
              <ActivityIndicator color={accent} size="small" />
            ) : (
              <IconSymbol name="chevron.right" size={22} color={muted} />
            )}
          </Pressable>

          <SectionLabel>Appearance</SectionLabel>
          <View className="mb-6 flex-row flex-wrap gap-2">
            {THEME_OPTIONS.map(({ key, label }) => {
              const selected =
                key === 'system'
                  ? hasAdaptiveThemes
                  : !hasAdaptiveThemes && storedPref === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => onPickTheme(key)}
                  className={`rounded-xl border px-4 py-2.5 ${
                    selected
                      ? 'border-ivy-accent bg-ivy-accent'
                      : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
                  }`}
                >
                  <IvyText
                    className={`text-sm font-medium ${selected ? 'text-zinc-900' : 'text-zinc-800 dark:text-zinc-200'}`}
                  >
                    {label}
                  </IvyText>
                </Pressable>
              );
            })}
          </View>

          <GoldGradientButton title="Sign out" onPress={onSignOut} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
