import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import '../global.css';

import { ClerkUserSync } from '@/components/clerk-user-sync';
import { IvyDarkNavigationTheme, IvyLightNavigationTheme } from '@/constants/navigation-theme';
import { useIvyColorScheme } from '@/hooks/use-ivy-color-scheme';
import { TrpcProvider } from '@/lib/trpc';
import { loadStoredThemePreference } from '@/lib/theme-preference';

SplashScreen.preventAutoHideAsync();

function getClerkPublishableKey(): string {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to .env or .env.local for the mobile app.',
    );
  }
  return key;
}

function RootLayoutNav() {
  const { isLoaded: authReady } = useAuth();
  const scheme = useIvyColorScheme();
  const [themeReady, setThemeReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    loadStoredThemePreference().finally(() => setThemeReady(true));
  }, []);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && themeReady && authReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, themeReady, authReady]);

  if (!fontsLoaded || !themeReady || !authReady) {
    return null;
  }

  const navigationTheme =
    scheme === 'dark' ? IvyDarkNavigationTheme : IvyLightNavigationTheme;

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="live" options={{ headerShown: false }} />
        <Stack.Screen name="testimonials" options={{ headerShown: false }} />
        <Stack.Screen
          name="episode/[videoId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal', headerShown: true }}
        />
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={getClerkPublishableKey()} tokenCache={tokenCache}>
      <TrpcProvider>
        <ClerkUserSync />
        <SafeAreaProvider>
          <RootLayoutNav />
        </SafeAreaProvider>
      </TrpcProvider>
    </ClerkProvider>
  );
}
