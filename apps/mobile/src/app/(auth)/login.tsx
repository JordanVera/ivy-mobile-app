import { useSignIn } from '@clerk/expo';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AuthOrDivider,
  GoogleSignInButton,
} from '@/components/auth/google-sign-in-button';
import { GoldGradientButton } from '@/components/ivy/gold-gradient-button';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';

export default function LoginScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const isBusy = fetchStatus === 'fetching';

  const extractErrorMessage = (error: unknown): string => {
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
  };

  const handleSubmit = async () => {
    setGlobalError(null);
    const { error } = await signIn.password({
      emailAddress,
      password,
    });
    if (error) {
      setGlobalError(extractErrorMessage(error));
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: () => {
          // Auth layout's isSignedIn guard handles the redirect once the
          // session is established — navigating here races the tab navigator.
        },
      });
    } else if (
      signIn.status === 'needs_second_factor' ||
      signIn.status === 'needs_client_trust'
    ) {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === 'email_code',
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: () => {
          // Auth layout's isSignedIn guard handles the redirect.
        },
      });
    }
  };

  if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
    return (
      <SafeAreaView
        style={{ flex: 1 }}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <View className="flex-1 bg-zinc-50 px-6 pt-8 dark:bg-zinc-950">
          <IvyHeading className="text-2xl text-amber-700 dark:text-amber-400">
            Verify your account
          </IvyHeading>
          <IvyText className="mt-2 text-zinc-600 dark:text-zinc-400">
            Enter the code we sent to your email.
          </IvyText>
          <TextInput
            value={code}
            placeholder="Verification code"
            placeholderTextColor="#a1a1aa"
            keyboardType="number-pad"
            className="mt-6 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            onChangeText={setCode}
          />
          {errors.fields?.code != null && (
            <IvyText className="mt-2 text-sm text-red-600 dark:text-red-400">
              {String(errors.fields.code.message ?? errors.fields.code)}
            </IvyText>
          )}
          <View className="mt-6">
            <GoldGradientButton
              title="Verify"
              onPress={handleVerify}
              disabled={isBusy || !code}
            />
          </View>
          {isBusy ? <ActivityIndicator className="mt-4" /> : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          className="justify-center px-6"
        >
          <View className="mb-10 items-center">
            <IvyHeading className="text-center text-3xl text-amber-700 dark:text-amber-400">
              IVY INC. SOARERS
            </IvyHeading>
            <IvyText className="mt-2 text-center text-zinc-600 dark:text-zinc-400">
              Sign in to continue
            </IvyText>
          </View>

          <GoogleSignInButton disabled={isBusy} />
          <AuthOrDivider />

          <View className="gap-3">
            <TextInput
              placeholder="Email"
              placeholderTextColor="#a1a1aa"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={emailAddress}
              onChangeText={setEmailAddress}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            {errors.fields?.identifier != null && (
              <IvyText className="text-sm text-red-600 dark:text-red-400">
                {String(
                  errors.fields.identifier.message ?? errors.fields.identifier,
                )}
              </IvyText>
            )}
            <TextInput
              placeholder="Password"
              placeholderTextColor="#a1a1aa"
              secureTextEntry
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            {errors.fields?.password != null && (
              <IvyText className="text-sm text-red-600 dark:text-red-400">
                {String(
                  errors.fields.password.message ?? errors.fields.password,
                )}
              </IvyText>
            )}
          </View>

          {globalError != null && (
            <IvyText className="mt-4 text-sm text-red-600 dark:text-red-400">
              {globalError}
            </IvyText>
          )}

          <View className="mt-4">
            <GoldGradientButton
              title="Sign in"
              onPress={handleSubmit}
              disabled={isBusy || !emailAddress || !password}
            />
          </View>
          {isBusy ? <ActivityIndicator className="mt-4" /> : null}

          <View className="mt-8 flex-row flex-wrap items-center justify-center gap-1">
            <IvyText className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              Need an account?
            </IvyText>
            <Link href="/sign-up" asChild>
              <Pressable>
                <IvyText className="text-sm text-amber-700 underline dark:text-amber-400">
                  Sign up
                </IvyText>
              </Pressable>
            </Link>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
