import { useAuth, useSignUp } from '@clerk/expo';
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
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AuthOrDivider,
  GoogleSignInButton,
} from '@/components/auth/google-sign-in-button';
import { IvyText } from '@/components/ivy/ivy-text';
import { Image as ExpoImage } from 'expo-image';

/**
 * Matches the auth shell used on `login.tsx` (same layout as web Clerk sign-in /
 * sign-up: hero strip + elevated card, social + email form).
 */
const HERO_IMAGE = require('@/assets/images/ivy-7.jpeg');

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
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
    const { error } = await signUp.password({
      firstName,
      lastName,
      emailAddress,
      password,
    });
    if (error) {
      setGlobalError(extractErrorMessage(error));
      return;
    }

    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    setGlobalError(null);
    await signUp.verifications.verifyEmailCode({
      code,
    });
    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: () => {
          // Auth layout's isSignedIn guard handles the redirect once the
          // session is established — navigating here races the tab navigator.
        },
      });
    }
  };

  const signUpDisabled =
    isBusy || !firstName || !lastName || !emailAddress || !password;
  const verifyDisabled = isBusy || !code;

  if (signUp.status === 'complete' || isSignedIn) {
    return null;
  }

  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
    return (
      <View className="flex-1 bg-transparent">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <View className="flex-1">
            <View className="min-h-[108px] flex-[2] overflow-hidden">
              <Image
                source={HERO_IMAGE}
                className="absolute inset-0 h-full w-full"
                resizeMode="cover"
              />
              <View className="flex-1 justify-end bg-ivy-accent/20 px-6 pb-6">
                <IvyText className="text-2xl font-bold leading-tight text-white">
                  Verify your email to finish setting up your account.
                </IvyText>
              </View>
            </View>

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
                  Verify your email
                </IvyText>
                <IvyText className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Enter the code we sent to {emailAddress || 'your inbox'}.
                </IvyText>

                <View className="mt-6 gap-3">
                  <View className="flex-row items-center gap-3 rounded-full bg-zinc-100 px-4 py-1 dark:bg-zinc-900">
                    <MaterialCommunityIcons
                      name="numeric"
                      size={22}
                      color="#71717a"
                    />
                    <TextInput
                      value={code}
                      placeholder="Verification code"
                      placeholderTextColor="#a1a1aa"
                      keyboardType="number-pad"
                      onChangeText={setCode}
                      className="min-h-[48px] flex-1 py-3 text-base text-zinc-900 dark:text-white"
                    />
                  </View>
                  {errors.fields?.code != null && (
                    <IvyText className="text-sm text-red-600 dark:text-red-400">
                      {String(errors.fields.code.message ?? errors.fields.code)}
                    </IvyText>
                  )}
                </View>

                {globalError != null && (
                  <IvyText className="mt-4 text-sm text-red-600 dark:text-red-400">
                    {globalError}
                  </IvyText>
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Verify email"
                  disabled={verifyDisabled}
                  onPress={handleVerify}
                  className={`mt-6 items-center rounded-full bg-ivy-accent py-4 active:opacity-90 ${
                    verifyDisabled ? 'opacity-50' : ''
                  }`}
                >
                  <IvyText className="text-base font-semibold text-zinc-900">
                    Verify
                  </IvyText>
                </Pressable>
                {isBusy ? (
                  <ActivityIndicator className="mt-4" color="#db2777" />
                ) : null}

                <Pressable
                  className="mt-4 items-center active:opacity-70"
                  onPress={() => signUp.verifications.sendEmailCode()}
                >
                  <IvyText className="text-sm font-semibold text-ivy-accent">
                    Resend code
                  </IvyText>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-transparent">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1">
          <View className="min-h-[108px] flex-[2] overflow-hidden">
            <ExpoImage
              source={HERO_IMAGE}
              contentFit="cover"
              contentPosition="top"
              style={StyleSheet.absoluteFillObject}
            />
            <View
              className="flex-1 justify-end bg-black/60 px-6 pb-6"
              pointerEvents="none"
            />
          </View>

          <View className="min-h-0 flex-[9.5] -mt-[18px] rounded-t-[32px] bg-white pt-2 shadow-[0_-4px_12px_rgb(0_0_0_/_0.08)] elevation-[8] dark:bg-zinc-950">
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
                Sign up
              </IvyText>

              <View className="mt-2 flex-row flex-wrap items-center gap-1">
                <IvyText className="text-sm text-zinc-600 dark:text-zinc-400">
                  Already have an account?
                </IvyText>
                <Link href="/login" asChild>
                  <Pressable>
                    <IvyText className="text-sm font-semibold text-ivy-accent">
                      Sign in
                    </IvyText>
                  </Pressable>
                </Link>
              </View>

              <View className="mt-6 gap-3">
                <View className="flex-row gap-3">
                  <View className="min-w-0 flex-1 flex-row items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-900">
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={22}
                      color="#71717a"
                    />
                    <TextInput
                      placeholder="First name"
                      placeholderTextColor="#a1a1aa"
                      autoCapitalize="words"
                      autoComplete="given-name"
                      value={firstName}
                      onChangeText={setFirstName}
                      className="min-h-[48px] flex-1 py-3 text-base text-zinc-900 dark:text-white"
                    />
                  </View>
                  <View className="min-w-0 flex-1 flex-row items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-900">
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={22}
                      color="#71717a"
                    />
                    <TextInput
                      placeholder="Last name"
                      placeholderTextColor="#a1a1aa"
                      autoCapitalize="words"
                      autoComplete="family-name"
                      value={lastName}
                      onChangeText={setLastName}
                      className="min-h-[48px] flex-1 py-3 text-base text-zinc-900 dark:text-white"
                    />
                  </View>
                </View>
                {(errors.fields?.firstName != null ||
                  errors.fields?.lastName != null) && (
                  <IvyText className="text-sm text-red-600 dark:text-red-400">
                    {[
                      errors.fields?.firstName &&
                        String(errors.fields.firstName),
                      errors.fields?.lastName && String(errors.fields.lastName),
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  </IvyText>
                )}

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
                {errors.fields?.emailAddress != null && (
                  <IvyText className="text-sm text-red-600 dark:text-red-400">
                    {String(
                      errors.fields.emailAddress.message ??
                        errors.fields.emailAddress,
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
                    autoComplete="new-password"
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

              <View className="mt-6" nativeID="clerk-captcha" />

              {globalError != null && (
                <IvyText className="mt-3 text-sm text-red-600 dark:text-red-400">
                  {globalError}
                </IvyText>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign up"
                disabled={signUpDisabled}
                onPress={handleSubmit}
                className={`mt-6 items-center rounded-full bg-ivy-accent py-4 active:opacity-90 ${
                  signUpDisabled ? 'opacity-50' : ''
                }`}
              >
                <IvyText className="text-base font-semibold text-zinc-900">
                  Sign up
                </IvyText>
              </Pressable>
              {isBusy ? (
                <ActivityIndicator className="mt-4" color="#db2777" />
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
