import type { ImageProps } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GrayscaleCoverImage } from '@/components/ivy/grayscale-cover-image';
import { IvyCard } from '@/components/ivy/ivy-card';
import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import { LiveEventHomeCard } from '@/components/ivy/live-event-home-card';
import { IconSymbol } from '@/components/ui/icon-symbol';

const ivyDailyEdge = require('@/assets/images/ivy-1.jpeg');
const ivyFocus = require('@/assets/images/ivy-7.jpeg');
const ivyTestimonials = require('@/assets/images/ivy-5.jpg');

export default function HomeScreen() {
  const router = useRouter();

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
          <TestimonialsSection
            onPress={() => router.push('/testimonials' as Href)}
          />
          <FeatureCard
            title="Daily Edge"
            dek="Short insight to sharpen your day."
            image={ivyDailyEdge}
            imageContentPosition="top"
          />
          <FeatureCard
            title="7-Day Focus Challenge"
            dek="Commit to one priority for the next week."
            image={ivyFocus}
            imageContentPosition="top"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type FeatureCardProps = {
  title: string;
  dek: string;
  image: number;
  /** Same as expo-image `contentFit` (Skia path mirrors it on iOS/Android). */
  imageContentFit?: ImageProps['contentFit'];
  /** Same as expo-image `contentPosition` — tune crop/focal point per asset. */
  imageContentPosition?: ImageProps['contentPosition'];
};

function FeatureCard({
  title,
  dek,
  image,
  imageContentFit = 'cover',
  imageContentPosition = 'center',
}: FeatureCardProps) {
  return (
    <IvyCard className="overflow-hidden p-0" style={styles.listCard}>
      <View className="flex-1 flex-row items-stretch">
        <View
          className="bg-zinc-200 dark:bg-zinc-800"
          style={styles.listCardImageFrame}
        >
          <GrayscaleCoverImage
            source={image}
            contentFit={imageContentFit}
            contentPosition={imageContentPosition}
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

/**
 * Editorial entry point on the home feed that sends the reader to the
 * full testimonials page. Photo-forward, with a dark scrim and a pull-quote
 * overlay so the section reads like a magazine's "What they're saying" page.
 */
function TestimonialsSection({ onPress }: { onPress: () => void }) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Watch video testimonials"
        className="mt-5 active:opacity-90"
      >
        <View
          className="w-full overflow-hidden rounded-2xl bg-zinc-900"
          style={styles.testimonialsFrame}
        >
          <GrayscaleCoverImage
            source={ivyTestimonials}
            contentFit="cover"
            contentPosition="top"
            accessible={false}
          />
          <LinearGradient
            colors={[
              'rgba(0,0,0,0.05)',
              'rgba(0,0,0,0.15)',
              'rgba(0,0,0,0.85)',
            ]}
            locations={[0, 0.45, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />

          <View className="absolute bottom-0 left-0 right-0 p-5">
            <IvyText className="text-[10px] font-semibold uppercase tracking-[3px] text-ivy-accent">
              Testimonials
            </IvyText>
            <IvyHeading
              level="brand"
              className="mt-2 text-[24px] leading-[1.15] text-white"
              numberOfLines={3}
            >
              Hear what Oprah, Tyler Perry, and more say about Ivy.
            </IvyHeading>
            <View className="mt-4 flex-row items-center justify-between border-t border-white/20 pt-3">
              <IvyText className="text-[11px] font-semibold uppercase tracking-[2.5px] text-ivy-accent">
                Watch testimonials
              </IvyText>
              <IconSymbol name="chevron.right" size={16} color="#ffffff" />
            </View>
          </View>
        </View>
      </Pressable>
    </View>
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
  /** Cinematic 16:10 landscape ratio — feels like a magazine plate. */
  testimonialsFrame: {
    width: '100%',
    aspectRatio: 16 / 10,
    position: 'relative',
  },
});
