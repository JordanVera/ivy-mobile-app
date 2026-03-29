import { Image } from 'expo-image';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoldGradientButton } from '@/components/ivy/gold-gradient-button';
import { IvyCard } from '@/components/ivy/ivy-card';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center py-4">
            <IvyHeading className="text-center text-xl tracking-tight text-amber-700 dark:text-amber-400">
              IVY INC. SOARERS
            </IvyHeading>
          </View>

          <IvyCard className="mb-6 overflow-hidden p-0">
            <Image
              source={require('@/assets/images/react-logo.png')}
              className="h-44 w-full bg-zinc-200 dark:bg-zinc-800"
              contentFit="cover"
            />
            <View className="p-4">
              <IvyText className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Featured
              </IvyText>
              <IvyHeading className="mt-1 text-2xl text-zinc-900 dark:text-white">
                Monday Mentoring Moment
              </IvyHeading>
              <IvyText className="mt-2 text-zinc-600 dark:text-zinc-400">
                Start your week with clarity, discipline, and bold leadership.
              </IvyText>
              <View className="mt-4">
                <GoldGradientButton title="Watch now" onPress={() => {}} />
              </View>
            </View>
          </IvyCard>

          <IvyText className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Continue
          </IvyText>

          <IvyCard className="mb-4 flex-row gap-3 p-3">
            <View className="h-20 w-28 overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
              <Image
                source={require('@/assets/images/partial-react-logo.png')}
                className="h-full w-full"
                contentFit="cover"
              />
            </View>
            <View className="flex-1 justify-center">
              <IvyText className="text-base font-semibold text-zinc-900 dark:text-white">
                Daily Edge
              </IvyText>
              <IvyText className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Short insight to sharpen your day.
              </IvyText>
            </View>
          </IvyCard>

          <IvyCard className="mb-4 flex-row gap-3 p-3">
            <View className="h-20 w-28 overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
              <Image
                source={require('@/assets/images/partial-react-logo.png')}
                className="h-full w-full"
                contentFit="cover"
              />
            </View>
            <View className="flex-1 justify-center">
              <IvyText className="text-base font-semibold text-zinc-900 dark:text-white">
                7-Day Focus Challenge
              </IvyText>
              <IvyText className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Commit to one priority for the next week.
              </IvyText>
            </View>
          </IvyCard>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
