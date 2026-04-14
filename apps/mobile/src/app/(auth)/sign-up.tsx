import { useAuth, useSignUp } from '@clerk/expo';
import { type Href, Link, useRouter } from 'expo-router';
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

import { GoldGradientButton } from '@/components/ivy/gold-gradient-button';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const isBusy = fetchStatus === 'fetching';

  const handleSubmit = async () => {
    const { error } = await signUp.password({
      emailAddress,
      password,
    });
    if (error) {
      return;
    }

    if (!error) {
      await signUp.verifications.sendEmailCode();
    }
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    });
    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) {
            return;
          }
          router.replace('/home' as Href);
        },
      });
    }
  };

  if (signUp.status === 'complete' || isSignedIn) {
    return null;
  }

  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
        <View className="flex-1 bg-zinc-50 px-6 pt-8 dark:bg-zinc-950">
          <IvyHeading className="text-2xl text-amber-700 dark:text-amber-400">Verify your email</IvyHeading>
          <IvyText className="mt-2 text-zinc-600 dark:text-zinc-400">
            Enter the code we sent to {emailAddress || 'your inbox'}.
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
            <GoldGradientButton title="Verify" onPress={handleVerify} disabled={isBusy || !code} />
          </View>
          <Pressable className="mt-4 items-center" onPress={() => signUp.verifications.sendEmailCode()}>
            <IvyText className="text-sm text-amber-700 underline dark:text-amber-400">Resend code</IvyText>
          </Pressable>
          {isBusy ? (
            <ActivityIndicator className="mt-4" />
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

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
              Create your account
            </IvyText>
          </View>

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
            {errors.fields?.emailAddress != null && (
              <IvyText className="text-sm text-red-600 dark:text-red-400">
                {String(errors.fields.emailAddress.message ?? errors.fields.emailAddress)}
              </IvyText>
            )}
            <TextInput
              placeholder="Password"
              placeholderTextColor="#a1a1aa"
              secureTextEntry
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            {errors.fields?.password != null && (
              <IvyText className="text-sm text-red-600 dark:text-red-400">
                {String(errors.fields.password.message ?? errors.fields.password)}
              </IvyText>
            )}
          </View>

          <View className="mt-6" nativeID="clerk-captcha" />

          <View className="mt-8">
            <GoldGradientButton
              title="Sign up"
              onPress={handleSubmit}
              disabled={isBusy || !emailAddress || !password}
            />
          </View>
          {isBusy ? (
            <ActivityIndicator className="mt-4" />
          ) : null}

          <View className="mt-8 flex-row flex-wrap items-center justify-center gap-1">
            <IvyText className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?
            </IvyText>
            <Link href="/login" asChild>
              <Pressable>
                <IvyText className="text-sm text-amber-700 underline dark:text-amber-400">Sign in</IvyText>
              </Pressable>
            </Link>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
