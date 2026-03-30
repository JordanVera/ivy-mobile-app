import { useAuth } from '@clerk/expo';
import { SignIn } from '@clerk/expo/web';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';

export default function LoginScreenWeb() {
  const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/home');
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
      <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
        <View className="items-center px-6 pb-4 pt-6">
          <IvyHeading className="text-center text-3xl text-amber-700 dark:text-amber-400">
            IVY INC. SOARERS
          </IvyHeading>
          <IvyText className="mt-2 text-center text-zinc-600 dark:text-zinc-400">
            Private community access
          </IvyText>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <SignIn routing="hash" />
        </View>
      </View>
    </SafeAreaView>
  );
}
