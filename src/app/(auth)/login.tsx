import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoldGradientButton } from '@/components/ivy/gold-gradient-button';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { useAuth } from '@/contexts/auth-context';

/*
 * Clerk (future, @clerk/expo): wrap the root app in <ClerkProvider publishableKey={...}>.
 * Use <SignedIn>/<SignedOut> or useAuth() from Clerk for session state. Replace the mock
 * AuthProvider signIn/signOut with Clerk flows (OAuth, email, etc.). Keep this route at
 * /login so file-based routing stays stable.
 */

export default function LoginScreen() {
  const { signIn } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
      <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          className="justify-center px-6">
        <View className="mb-10 items-center">
          <IvyHeading className="text-center text-3xl text-amber-700 dark:text-amber-400">
            IVY INC. SOARERS
          </IvyHeading>
          <IvyText className="mt-2 text-center text-zinc-600 dark:text-zinc-400">
            Private community access
          </IvyText>
        </View>

        <View className="gap-3">
          <TextInput
            placeholder="Email (placeholder)"
            placeholderTextColor="#a1a1aa"
            keyboardType="email-address"
            autoCapitalize="none"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
          <TextInput
            placeholder="Password (placeholder)"
            placeholderTextColor="#a1a1aa"
            secureTextEntry
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </View>

        <View className="mt-8">
          <GoldGradientButton
            title="Sign in"
            onPress={async () => {
              await signIn();
              router.replace('/home');
            }}
          />
        </View>

        <Pressable
          className="mt-6 items-center"
          onPress={async () => {
            await signIn();
            router.replace('/home');
          }}>
          <IvyText className="text-sm text-amber-700 underline dark:text-amber-400">
            Dev: skip to app
          </IvyText>
        </Pressable>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
