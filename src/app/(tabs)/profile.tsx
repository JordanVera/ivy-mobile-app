import { useClerk, useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { GoldGradientButton } from '@/components/ivy/gold-gradient-button';
import { IvyCard } from '@/components/ivy/ivy-card';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { getThemePreference, setThemePreference, type ThemePreference } from '@/lib/theme-preference';

const THEME_OPTIONS: { key: ThemePreference; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { hasAdaptiveThemes } = useUniwind();
  const [storedPref, setStoredPref] = useState<ThemePreference>('light');

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

  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <IvyHeading className="text-2xl text-zinc-900 dark:text-white">Profile</IvyHeading>
          <IvyText className="mt-1 text-zinc-600 dark:text-zinc-400">
            Member · Ivy Inc. Soarers
          </IvyText>
        </View>

        <IvyCard className="mb-6">
          <IvyText className="text-base font-semibold text-zinc-900 dark:text-white">
            Account
          </IvyText>
          <IvyText className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {primaryEmail ?? 'Signed in with Clerk'}
          </IvyText>
        </IvyCard>

        <IvyText className="mb-2 text-sm font-semibold text-zinc-900 dark:text-white">Appearance</IvyText>
        <View className="mb-2 flex-row flex-wrap gap-2">
          {THEME_OPTIONS.map(({ key, label }) => {
            const selected =
              key === 'system' ? hasAdaptiveThemes : !hasAdaptiveThemes && storedPref === key;
            return (
              <Pressable
                key={key}
                onPress={() => onPickTheme(key)}
                className={`rounded-xl border px-4 py-2.5 ${
                  selected
                    ? 'border-amber-600 bg-amber-600 dark:border-amber-500 dark:bg-amber-600'
                    : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
                }`}>
                <IvyText
                  className={`text-sm font-medium ${selected ? 'text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
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
