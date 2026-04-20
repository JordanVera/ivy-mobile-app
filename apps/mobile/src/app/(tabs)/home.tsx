import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoldGradientButton } from '@/components/ivy/gold-gradient-button';
import { IvyCard } from '@/components/ivy/ivy-card';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { useRouter } from 'expo-router';

const ivyHero = require('@/assets/images/ivy-3.jpeg');
const ivyDailyEdge = require('@/assets/images/ivy-1.jpeg');
const ivyFocus = require('@/assets/images/ivy-7.jpeg');

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
        <View className="flex-1 flex-col px-4 pb-4">
          {/* <View className="flex-row items-center justify-center gap-2 py-4">
            <IvyHeading className="text-center text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
              Welcome to IVY INC. SOARERS
            </IvyHeading>
            <MaterialIcons name="star" size={16} color="#d97706" />
          </View> */}

          <View className="shrink-0">
            <IvyCard className="mb-6 overflow-hidden p-0">
              <View className="min-h-[220px] flex-row items-stretch">
                <View className="flex-1 justify-center px-4 py-5">
                  <IvyText className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                    Featured
                  </IvyText>
                  <IvyHeading className="mt-1 text-2xl leading-tight text-zinc-900 dark:text-white">
                    Monday Mentorship Moment
                  </IvyHeading>
                  <IvyText className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Start your week with clarity, discipline, and bold
                    leadership.
                  </IvyText>
                  <View className="mt-4 self-start">
                    <GoldGradientButton
                      title="Watch Now"
                      onPress={() => {
                        router.push('/watch');
                      }}
                    />
                  </View>
                </View>
                <View
                  className="bg-zinc-200 dark:bg-zinc-800"
                  style={styles.heroImageFrame}
                >
                  <Image
                    source={ivyHero}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    contentPosition="top"
                  />
                </View>
              </View>
            </IvyCard>
          </View>

          <View className="min-h-0 flex-1 flex-col gap-4">
            <IvyCard className="min-h-0 flex-1 overflow-hidden p-0">
              <View className="min-h-0 flex-1 flex-row items-stretch">
                <View
                  className="bg-zinc-200 dark:bg-zinc-800"
                  style={styles.listCardImageFrame}
                >
                  <Image
                    source={ivyDailyEdge}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    contentPosition="top"
                  />
                </View>
                <View className="min-h-0 min-w-0 flex-1 justify-center px-4 py-5">
                  <IvyHeading className="text-2xl leading-tight text-zinc-900 dark:text-white">
                    Daily Edge
                  </IvyHeading>
                  <IvyText className="mt-2 text-lg leading-snug text-zinc-600 dark:text-zinc-400">
                    Short insight to sharpen your day.
                  </IvyText>
                </View>
              </View>
            </IvyCard>

            <IvyCard className="min-h-0 flex-1 overflow-hidden p-0">
              <View className="min-h-0 flex-1 flex-row items-stretch">
                <View
                  className="bg-zinc-200 dark:bg-zinc-800"
                  style={styles.listCardImageFrame}
                >
                  <Image
                    source={ivyFocus}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    contentPosition="top"
                  />
                </View>
                <View className="min-h-0 min-w-0 flex-1 justify-center px-4 py-5">
                  <IvyHeading className="text-2xl leading-tight text-zinc-900 dark:text-white">
                    7-Day Focus Challenge
                  </IvyHeading>
                  <IvyText className="mt-2 text-lg leading-snug text-zinc-600 dark:text-zinc-400">
                    Commit to one priority for the next week.
                  </IvyText>
                </View>
              </View>
            </IvyCard>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroImageFrame: {
    width: '42%',
    minWidth: 130,
    minHeight: 220,
    alignSelf: 'stretch',
    position: 'relative',
    overflow: 'hidden',
  },
  /** Left column image: same proportions as featured hero strip, fills card height. */
  listCardImageFrame: {
    width: '42%',
    minWidth: 130,
    alignSelf: 'stretch',
    position: 'relative',
    overflow: 'hidden',
  },
});
