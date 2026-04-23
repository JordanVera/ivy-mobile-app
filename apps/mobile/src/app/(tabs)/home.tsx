import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IvyCard } from '@/components/ivy/ivy-card';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { LiveEventHomeCard } from '@/components/ivy/live-event-home-card';

const ivyDailyEdge = require('@/assets/images/ivy-1.jpeg');
const ivyFocus = require('@/assets/images/ivy-7.jpeg');

/**
 * Diagonal, three-stop color washes laid over each card's image. Colors are
 * pulled from the Tailwind palette and kept at partial alpha so the photo
 * underneath still reads through.
 */
// Daily Edge: warm "sunrise" — orange-400 → pink-500 → purple-500
const SUNRISE_GRADIENT = [
  'rgba(251, 146, 60, 0.60)',
  'rgba(236, 72, 153, 0.50)',
  'rgba(168, 85, 247, 0.55)',
] as const;
// 7-Day Focus: cool "twilight" — cyan-400 → violet-500 → pink-500
const TWILIGHT_GRADIENT = [
  'rgba(34, 211, 238, 0.55)',
  'rgba(139, 92, 246, 0.50)',
  'rgba(236, 72, 153, 0.55)',
] as const;

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
          <FeatureCard
            title="Daily Edge"
            dek="Short insight to sharpen your day."
            image={ivyDailyEdge}
            gradient={SUNRISE_GRADIENT}
          />
          <FeatureCard
            title="7-Day Focus Challenge"
            dek="Commit to one priority for the next week."
            image={ivyFocus}
            gradient={TWILIGHT_GRADIENT}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type GradientStops = readonly [string, string, ...string[]];

type FeatureCardProps = {
  title: string;
  dek: string;
  image: number;
  gradient: GradientStops;
};

function FeatureCard({ title, dek, image, gradient }: FeatureCardProps) {
  return (
    <IvyCard className="overflow-hidden p-0" style={styles.listCard}>
      <View className="flex-1 flex-row items-stretch">
        <View
          className="bg-zinc-200 dark:bg-zinc-800"
          style={styles.listCardImageFrame}
        >
          <Image
            source={image}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            contentPosition="top"
          />
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </View>
        <View className="min-w-0 flex-1 justify-center px-4 py-5">
          <IvyHeading className="text-2xl leading-tight text-zinc-900 dark:text-white">
            {title}
          </IvyHeading>
          <IvyText className="mt-2 text-lg leading-snug text-zinc-600 dark:text-zinc-400">
            {dek}
          </IvyText>
        </View>
      </View>
    </IvyCard>
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
  /** Left column image: same proportions as featured hero strip, fills card height. */
  listCardImageFrame: {
    width: '42%',
    minWidth: 130,
    alignSelf: 'stretch',
    position: 'relative',
    overflow: 'hidden',
  },
});
