import { useSignIn } from '@clerk/expo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  AuthOrDivider,
  GoogleSignInButton,
} from '@/components/auth/google-sign-in-button';
import { GoldGradientButton } from '@/components/ivy/gold-gradient-button';
import { IvyText } from '@/components/ivy/ivy-text';

/** Placeholder hero art — swap anytime */
const HERO_IMAGE = require('@/assets/images/nebula.jpg');

export default function LoginScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const isBusy = fetchStatus === 'fetching';

  const logoSource =
    colorScheme === 'dark'
      ? require('@/assets/images/ivy-soarers-logo-white.png')
      : require('@/assets/images/ivy-soarers-logo-black.png');

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

  const signInDisabled = isBusy || !emailAddress || !password;

  if (
    signIn.status === 'needs_second_factor' ||
    signIn.status === 'needs_client_trust'
  ) {
    return (
      <SafeAreaView
        className="flex-1"
        edges={['top', 'left', 'right', 'bottom']}
      >
        <View className="flex-1 bg-zinc-50 px-6 pt-8 dark:bg-zinc-950">
          {/* <IvyHeading className="text-2xl text-ivy-accent">
            Verify your account
          </IvyHeading> */}

          {/* <View className="my-4 w-full items-center">
          <Image
            source={
              useColorScheme() === 'dark'
                ? require('@/assets/images/ivy-mmm-logo-white.png')
                : require('@/assets/images/ivy-mmm-logo-black.png')
            }
            className="h-[100px] w-full"
            resizeMode="contain"
          />
        </View> */}
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
    <View className="flex-1 bg-transparent">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1">
          {/* Hero — ~20% height; card flex below takes the rest */}
          <View className="min-h-[108px] flex-[2] overflow-hidden">
            <Image
              source={HERO_IMAGE}
              className="absolute inset-0 h-full w-full"
              resizeMode="cover"
            />
            <View className="flex-1 justify-end bg-ivy-accent/20 px-6 pb-6"></View>
          </View>

          {/* Card — ~80% of height (flex 8 vs hero flex 2) */}
          <View className="min-h-0 flex-[8] -mt-[18px] rounded-t-[32px] bg-white pt-2 shadow-[0_-4px_12px_rgb(0_0_0_/_0.08)] elevation-[8] dark:bg-zinc-950">
            <ScrollView
              className="flex-1"
              contentContainerClassName="flex-grow px-6 pt-5"
              contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="mb-6 items-center">
                <Image
                  source={logoSource}
                  className="h-12 w-[200px]"
                  resizeMode="contain"
                />
              </View>

              <IvyText className="text-2xl font-bold text-zinc-900 dark:text-white">
                Sign in
              </IvyText>

              <View className="mt-2 flex-row flex-wrap items-center gap-1">
                <IvyText className="text-sm text-zinc-600 dark:text-zinc-400">
                  Need an account?
                </IvyText>
                <Link href="/sign-up" asChild>
                  <Pressable>
                    <IvyText className="text-sm font-semibold text-ivy-accent">
                      Sign up
                    </IvyText>
                  </Pressable>
                </Link>
              </View>

              <View className="mt-6 gap-3">
                <View className="flex-row items-center gap-3 rounded-full bg-zinc-100 px-4 py-1 dark:bg-zinc-900">
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={22}
                    color="#71717a"
                  />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#a1a1aa"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    className="min-h-[48px] flex-1 py-3 text-base text-zinc-900 dark:text-white"
                  />
                </View>
                {errors.fields?.identifier != null && (
                  <IvyText className="text-sm text-red-600 dark:text-red-400">
                    {String(
                      errors.fields.identifier.message ??
                        errors.fields.identifier,
                    )}
                  </IvyText>
                )}
                <View className="flex-row items-center gap-3 rounded-full bg-zinc-100 px-4 py-1 dark:bg-zinc-900">
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={22}
                    color="#71717a"
                  />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#a1a1aa"
                    secureTextEntry
                    autoComplete="password"
                    value={password}
                    onChangeText={setPassword}
                    className="min-h-[48px] flex-1 py-3 text-base text-zinc-900 dark:text-white"
                  />
                </View>
                {errors.fields?.password != null && (
                  <IvyText className="text-sm text-red-600 dark:text-red-400">
                    {String(
                      errors.fields.password.message ?? errors.fields.password,
                    )}
                  </IvyText>
                )}
              </View>

              <View className="mt-4 flex-row items-center">
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: rememberMe }}
                  className="flex-row items-center gap-2 active:opacity-70"
                  onPress={() => setRememberMe((v) => !v)}
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded border-2 ${
                      rememberMe
                        ? 'border-ivy-accent bg-ivy-accent'
                        : 'border-zinc-300 bg-transparent dark:border-zinc-600'
                    }`}
                  >
                    {rememberMe ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={14}
                        color="#ffffff"
                      />
                    ) : null}
                  </View>
                  <IvyText className="text-sm text-zinc-600 dark:text-zinc-400">
                    Remember me
                  </IvyText>
                </Pressable>
              </View>

              {globalError != null && (
                <IvyText className="mt-4 text-sm text-red-600 dark:text-red-400">
                  {globalError}
                </IvyText>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign in"
                disabled={signInDisabled}
                onPress={handleSubmit}
                className={`mt-6 items-center rounded-full bg-ivy-accent py-4 active:opacity-90 ${
                  signInDisabled ? 'opacity-50' : ''
                }`}
              >
                <IvyText className="text-base font-semibold text-white">
                  Sign in
                </IvyText>
              </Pressable>
              {isBusy ? (
                <ActivityIndicator className="mt-4" color="#0d9488" />
              ) : null}

              <AuthOrDivider label="Or continue with" />
              <GoogleSignInButton disabled={isBusy} pill />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
