import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { LiveEventHomeCard } from '@/components/ivy/live-event-home-card';

const dailyEdgeHero: number = require('@/assets/images/ivy-1.jpeg');
const focusChallengeHero: number = require('@/assets/images/ivy-7.jpeg');

type Feature = {
  eyebrow: string;
  title: string;
  dek: string;
  image: number;
};

const FEATURES: readonly Feature[] = [
  {
    eyebrow: 'Daily Ritual',
    title: 'Daily Edge',
    dek: 'A short, sharpening insight to set the tone for your day.',
    image: dailyEdgeHero,
  },
  {
    eyebrow: 'This Week',
    title: '7-Day Focus Challenge',
    dek: 'Commit to a single priority and watch your week compound.',
    image: focusChallengeHero,
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={['top', 'left', 'right']}
      className="bg-zinc-50 dark:bg-zinc-950"
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <LiveEventHomeCard />

        {FEATURES.map((feature, idx) => (
          <View key={feature.title}>
            <SectionDivider label={idx === 0 ? 'Today' : 'The Week Ahead'} />
            <FeatureCoverCard feature={feature} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Centered eyebrow + thin amber rule used to separate editorial sections on
 * the home feed. Mirrors the "More to watch" separator on the Watch tab.
 */
function SectionDivider({ label }: { label: string }) {
  return (
    <View className="mt-10 mb-6 items-center">
      <IvyText className="text-[10px] font-semibold uppercase tracking-[3px] text-zinc-500 dark:text-zinc-400">
        {label}
      </IvyText>
      <View className="mt-3 h-px w-12 bg-amber-700 dark:bg-amber-500" />
    </View>
  );
}

/**
 * Full-width, photo-forward editorial cover. Image on top, eyebrow + serif
 * title + dek underneath – a single-column, image-first layout in the same
 * spirit as the Watch feed cards.
 */
function FeatureCoverCard({ feature }: { feature: Feature }) {
  return (
    <View className="mb-4">
      <View
        className="w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900"
        style={styles.coverFrame}
      >
        <Image
          source={feature.image}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          accessible={false}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        <View className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-6">
          <IvyText className="text-[10px] font-semibold uppercase tracking-[3px] text-amber-300">
            {feature.eyebrow}
          </IvyText>
          <IvyHeading
            level="brand"
            className="mt-2 text-[26px] leading-[1.15] text-white"
            numberOfLines={3}
          >
            {feature.title}
          </IvyHeading>
        </View>
      </View>

      <View className="px-5 pt-4">
        <IvyText className="text-[15px] leading-[1.45] text-zinc-600 dark:text-zinc-400">
          {feature.dek}
        </IvyText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  coverFrame: {
    width: '100%',
    aspectRatio: 4 / 5,
    position: 'relative',
    overflow: 'hidden',
  },
});
