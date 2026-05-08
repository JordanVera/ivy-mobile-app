import { useAuth } from '@clerk/expo';
import { useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HubCard } from '@/components/ivy/hub-card';
import { IvyText } from '@/components/ivy/ivy-text';
import { ScreenHeader } from '@/components/ivy/screen-header';
import { useToast } from '@/components/ivy/toast-provider';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';
import { trpc } from '@/lib/trpc';

const ACCENT = IvyColors.accent;

/** Default icon if a hub row is missing one or has an icon we don't yet map. */
const FALLBACK_ICON: IconSymbolName = 'person.3.fill';

type GradientStops = readonly [string, string, ...string[]];

/**
 * Thematic Unsplash images and gradient overlays for each canonical hub.
 * Keyed by hub slug; if a hub isn't mapped here, it falls back to no-image mode.
 */
const HUB_VISUALS: Record<
  string,
  { imageUrl: string; gradient: GradientStops }
> = {
  entrepreneurs: {
    imageUrl:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
    gradient: [
      'rgba(251, 146, 60, 0.60)',
      'rgba(236, 72, 153, 0.50)',
      'rgba(168, 85, 247, 0.55)',
    ] as const,
  },
  'college-life': {
    imageUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    gradient: [
      'rgba(34, 211, 238, 0.55)',
      'rgba(139, 92, 246, 0.50)',
      'rgba(236, 72, 153, 0.55)',
    ] as const,
  },
  'golden-age': {
    imageUrl:
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80',
    gradient: [
      'rgba(251, 191, 36, 0.55)',
      'rgba(244, 63, 94, 0.50)',
      'rgba(99, 102, 241, 0.55)',
    ] as const,
  },
  'ahh-man': {
    imageUrl:
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
    gradient: [
      'rgba(99, 102, 241, 0.60)',
      'rgba(59, 130, 246, 0.50)',
      'rgba(6, 182, 212, 0.55)',
    ] as const,
  },
};

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

export default function TheNestScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const utils = trpc.useUtils();
  const toast = useToast();

  const hubsQuery = trpc.hubs.list.useQuery();

  const join = trpc.hubs.join.useMutation({
    onSuccess: (_data, variables) => {
      void utils.hubs.list.invalidate();
      const hub = hubsQuery.data?.find((h) => h.slug === variables.slug);
      if (hub) {
        toast.showSuccess(`You joined ${hub.name}!`);
      }
    },
  });
  const leave = trpc.hubs.leave.useMutation({
    onSuccess: (_data, variables) => {
      void utils.hubs.list.invalidate();
      const hub = hubsQuery.data?.find((h) => h.slug === variables.slug);
      if (hub) {
        toast.showSuccess(`You left ${hub.name}`);
      }
    },
  });

  const openHub = useCallback(
    (slug: string) => {
      router.push(`/hub/${slug}` as Href);
    },
    [router],
  );

  const toggleJoin = useCallback(
    (slug: string, joined: boolean) => {
      if (!isSignedIn) {
        router.push('/login' as Href);
        return;
      }
      if (joined) {
        leave.mutate({ slug });
      } else {
        join.mutate({ slug });
      }
    },
    [isSignedIn, join, leave, router],
  );

  const pendingSlug = join.variables?.slug ?? leave.variables?.slug ?? null;
  const isMutating = join.isPending || leave.isPending;

  const myHubs = hubsQuery.data?.filter((h) => h.joined) ?? [];
  const allHubs = hubsQuery.data?.filter((h) => !h.joined) ?? [];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="The Nest"
        right={
          <Pressable className="p-2" hitSlop={8}>
            <IconSymbol name="magnifyingglass" size={22} color={ACCENT} />
          </Pressable>
        }
      />

      <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {hubsQuery.isLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator color={ACCENT} />
            </View>
          ) : hubsQuery.isError ? (
            <View className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
              <IvyText className="text-sm text-red-800 dark:text-red-200">
                {hubsQuery.error.message}
              </IvyText>
              <Pressable
                onPress={() => void hubsQuery.refetch()}
                className="mt-3 self-start rounded-full border border-red-300 px-4 py-2 dark:border-red-800"
              >
                <IvyText className="text-[11px] font-semibold uppercase tracking-[2px] text-red-800 dark:text-red-200">
                  Retry
                </IvyText>
              </Pressable>
            </View>
          ) : hubsQuery.data?.length === 0 ? (
            <View className="mt-8 items-center rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <IvyText className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                No hubs yet. Check back soon.
              </IvyText>
            </View>
          ) : (
            <>
              {myHubs.length > 0 ? (
                <>
                  <View className="mt-8 mb-3 flex-row items-end justify-between">
                    <IvyText className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      My Hubs
                    </IvyText>
                    {hubsQuery.isFetching && !hubsQuery.isLoading ? (
                      <ActivityIndicator size="small" color={ACCENT} />
                    ) : null}
                  </View>
                  {myHubs.map((hub) => {
                    const visuals = HUB_VISUALS[hub.slug];
                    return (
                      <HubCard
                        key={hub.id}
                        name={hub.name}
                        tagline={hub.tagline}
                        icon={resolveIcon(hub.icon)}
                        memberCount={hub.memberCount}
                        joined={hub.joined}
                        joinPending={isMutating && pendingSlug === hub.slug}
                        onOpen={() => openHub(hub.slug)}
                        onToggleJoin={() => toggleJoin(hub.slug, hub.joined)}
                        imageUrl={visuals?.imageUrl}
                        gradient={visuals?.gradient}
                      />
                    );
                  })}
                </>
              ) : null}

              {allHubs.length > 0 ? (
                <>
                  <View
                    className={`mb-3 flex-row items-end justify-between ${myHubs.length > 0 ? 'mt-8' : 'mt-8'}`}
                  >
                    <IvyText className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      All Hubs
                    </IvyText>
                  </View>
                  {allHubs.map((hub) => {
                    const visuals = HUB_VISUALS[hub.slug];
                    return (
                      <HubCard
                        key={hub.id}
                        name={hub.name}
                        tagline={hub.tagline}
                        icon={resolveIcon(hub.icon)}
                        memberCount={hub.memberCount}
                        joined={hub.joined}
                        joinPending={isMutating && pendingSlug === hub.slug}
                        onOpen={() => openHub(hub.slug)}
                        onToggleJoin={() => toggleJoin(hub.slug, hub.joined)}
                        imageUrl={visuals?.imageUrl}
                        gradient={visuals?.gradient}
                      />
                    );
                  })}
                </>
              ) : null}
            </>
          )}

          {!isSignedIn ? (
            <View className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-100/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
              <IvyText className="text-sm text-zinc-600 dark:text-zinc-400">
                Sign in to join a hub and chat with the community.
              </IvyText>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
