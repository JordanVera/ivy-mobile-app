import { useSSO } from '@clerk/expo';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';

import { IvyText } from '@/components/ivy/ivy-text';

function extractErrorMessage(error: unknown): string {
  if (!error) return 'Something went wrong. Please try again.';
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>;
    const firstClerkError =
      Array.isArray(e.errors) && e.errors.length > 0
        ? (e.errors[0] as Record<string, unknown>)
        : null;
    if (firstClerkError?.longMessage)
      return String(firstClerkError.longMessage);
    if (firstClerkError?.message) return String(firstClerkError.message);
    if (typeof e.message === 'string') return e.message;
  }
  return 'Something went wrong. Please try again.';
}

function isUserCancellation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: string }).code;
  return code === 'SIGN_IN_CANCELLED' || code === '-5';
}

type GoogleSignInButtonProps = {
  disabled?: boolean;
  /** Rounded pill shape to match auth card layouts */
  pill?: boolean;
};

/**
 * Google via Clerk `useSSO` (`oauth_google`): in-app browser on iOS/Android, same as web.
 * Avoids `@clerk/expo/google`, which requires the native `expo-crypto` module and a fresh native build.
 * Add your app redirect URL in Clerk (e.g. `ivymobileapp://sso-callback` from expo-auth-session).
 */
export function GoogleSignInButton({
  disabled,
  pill = false,
}: GoogleSignInButtonProps) {
  const { startSSOFlow } = useSSO();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePress = async () => {
    setError(null);
    setBusy(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (e) {
      if (isUserCancellation(e)) return;
      setError(extractErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
        disabled={disabled || busy}
        onPress={handlePress}
        className={`flex-row items-center justify-center gap-2 border border-zinc-200 bg-white py-3.5 active:opacity-90 dark:border-zinc-600 dark:bg-zinc-900 ${
          pill ? 'rounded-full' : 'rounded-xl'
        }`}
      >
        {busy ? (
          <ActivityIndicator color="#a16207" />
        ) : (
          <>
            <Image
              source={require('@/assets/images/google-g-icon.png')}
              className="w-7 h-7"
            />
            <IvyText className="text-base font-bold text-black dark:text-white">
              Continue with Google
            </IvyText>
          </>
        )}
      </Pressable>
      {error != null ? (
        <IvyText className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </IvyText>
      ) : null}
    </View>
  );
}

type AuthOrDividerProps = {
  label?: string;
};

export function AuthOrDivider({ label = 'OR' }: AuthOrDividerProps) {
  return (
    <View className="my-5 flex-row items-center gap-3">
      <View className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      <IvyText className="text-sm text-zinc-500 dark:text-zinc-400">
        {label}
      </IvyText>
      <View className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
    </View>
  );
}
