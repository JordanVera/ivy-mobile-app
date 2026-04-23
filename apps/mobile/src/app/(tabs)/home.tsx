import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IvyCard } from '@/components/ivy/ivy-card';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { LiveEventHomeCard } from '@/components/ivy/live-event-home-card';

const ivyDailyEdge = require('@/assets/images/ivy-1.jpeg');
const ivyFocus = require('@/assets/images/ivy-7.jpeg');

export default function HomeScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={['top', 'left', 'right']}
      className="bg-zinc-50 dark:bg-zinc-950"
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <LiveEventHomeCard />

        <View className="mt-4 gap-4 px-4">
          <IvyCard className="overflow-hidden p-0" style={styles.listCard}>
            <View className="flex-1 flex-row items-stretch">
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
                <View pointerEvents="none" style={styles.imageDarkOverlay} />
              </View>
              <View className="min-w-0 flex-1 justify-center px-4 py-5">
                <IvyHeading className="text-2xl leading-tight text-zinc-900 dark:text-white">
                  Daily Edge
                </IvyHeading>
                <IvyText className="mt-2 text-lg leading-snug text-zinc-600 dark:text-zinc-400">
                  Short insight to sharpen your day.
                </IvyText>
              </View>
            </View>
          </IvyCard>

          <IvyCard className="overflow-hidden p-0" style={styles.listCard}>
            <View className="flex-1 flex-row items-stretch">
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
                <View pointerEvents="none" style={styles.imageDarkOverlay} />
              </View>
              <View className="min-w-0 flex-1 justify-center px-4 py-5">
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /**
   * Fixed card height so the image/text rows look the same regardless of
   * where they land in the scroll feed now that the hero is full-bleed.
   */
  listCard: {
    height: 150,
  },
  imageDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
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
