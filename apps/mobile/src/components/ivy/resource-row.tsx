import { Image, type ImageSource } from 'expo-image';
import {
  openBrowserAsync,
  WebBrowserPresentationStyle,
} from 'expo-web-browser';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

import { IvyText } from './ivy-text';

/**
 * Accepts either a remote URL (string) or a local `require`'d asset (number)
 * or an `expo-image` `ImageSource` object.
 */
type ResourceImage = string | number | ImageSource | null | undefined;

type ResourceRowProps = {
  title: string;
  imageUrl?: ResourceImage;
  url?: string;
  onPress?: () => void;
};

function resolveImageSource(input: ResourceImage): ImageSource | number | null {
  if (input == null) return null;
  if (typeof input === 'number') return input;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    return trimmed ? { uri: trimmed } : null;
  }
  return input;
}

export function ResourceRow({
  title,
  imageUrl,
  url,
  onPress,
}: ResourceRowProps) {
  const openResource = () => {
    if (onPress) {
      onPress();
      return;
    }
    const href = url?.trim();
    if (href) {
      void openBrowserAsync(href, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    }
  };

  const imageSource = resolveImageSource(imageUrl);

  if (imageSource) {
    return (
      <Pressable
        onPress={openResource}
        accessibilityRole="button"
        accessibilityLabel={`${title}, open resource`}
        className="mb-3 overflow-hidden rounded-2xl border border-zinc-200 active:opacity-90 dark:border-zinc-800"
      >
        <View className="relative w-full" style={styles.imageArea}>
          <Image
            source={imageSource}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            accessible={false}
          />
          <View pointerEvents="none" className="absolute inset-0 bg-black/45" />
          <View
            className="flex-1 flex-row items-center justify-between gap-2 px-3 py-2"
            style={StyleSheet.absoluteFillObject}
          >
            <IvyText
              className="flex-1 text-base font-semibold text-white"
              numberOfLines={1}
            >
              {title}
            </IvyText>
            <View className="shrink-0 flex-row items-center gap-1">
              <IconSymbol name="doc.fill" size={15} color="#fef3c7" />
              <IvyText className="text-xs font-medium text-amber-100">
                PDF
              </IvyText>
              <IconSymbol name="chevron.right" size={18} color="#fef3c7" />
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={openResource}
      className="mb-2 flex-row items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 active:opacity-80"
    >
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
        <IconSymbol name="archivebox.fill" size={26} color="#b45309" />
      </View>
      <IvyText className="flex-1 text-base font-medium text-zinc-900 dark:text-white">
        {title}
      </IvyText>
      <IconSymbol name="chevron.right" size={22} color="#a1a1aa" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imageArea: {
    width: '100%',
    height: 96,
    position: 'relative',
    overflow: 'hidden',
  },
});
