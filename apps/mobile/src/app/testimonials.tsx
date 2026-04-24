import { Stack, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IvyHeading } from '@/components/ivy/ivy-heading';
import { IvyText } from '@/components/ivy/ivy-text';
import {
  TestimonialVideoCard,
  type TestimonialVideoCardProps,
} from '@/components/ivy/testimonial-video-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';

const ACCENT = IvyColors.accent;

type Testimonial = Pick<
  TestimonialVideoCardProps,
  'name' | 'role' | 'quote' | 'source'
> & { id: string };

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'oprah-1',
    name: 'Oprah Winfrey',
    role: 'Media Leader · Philanthropist',
    quote: 'Ivy is a force — her work changes how we lead and live.',
    source: require('@/assets/testimonials/oprah-1.mp4'),
  },
  {
    id: 'tyler-perry-1',
    name: 'Tyler Perry',
    role: 'Filmmaker · Founder, Tyler Perry Studios',
    quote: 'A rare voice that calls the best out of every room she enters.',
    source: require('@/assets/testimonials/tyler-perry-1.mp4'),
  },
];

export default function TestimonialsScreen() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);

  const handlePlay = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/home' as Href);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={{ flex: 1 }}
        edges={['top', 'left', 'right']}
        className="bg-zinc-50 dark:bg-zinc-950"
      >
        <View className="flex-row items-center justify-between px-4 py-2">
          <Pressable
            onPress={goBack}
            hitSlop={12}
            accessibilityLabel="Back"
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <IconSymbol name="chevron.left" size={24} color={ACCENT} />
          </Pressable>
          <IvyText className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
            Testimonials
          </IvyText>
          <View className="h-10 w-10" />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-6 items-center">
            <IvyText className="text-[10px] font-semibold uppercase tracking-[3px] text-ivy-accent">
              Voices on Ivy
            </IvyText>
            <View className="mt-3 h-px w-12 bg-ivy-accent" />
            <IvyHeading
              level="brand"
              className="mt-4 text-center text-[28px] leading-[1.2] text-zinc-900 dark:text-white"
            >
              Hear what leaders say.
            </IvyHeading>
            <IvyText className="mt-2 max-w-[280px] text-center text-[14px] leading-[1.4] text-zinc-600 dark:text-zinc-400">
              A few of the people whose work and words echo Ivy’s mission.
            </IvyText>
          </View>

          <View className="mt-8 gap-6">
            {TESTIMONIALS.map((t) => (
              <TestimonialVideoCard
                key={t.id}
                name={t.name}
                role={t.role}
                quote={t.quote}
                source={t.source}
                active={activeId === null || activeId === t.id}
                onPlay={() => handlePlay(t.id)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
