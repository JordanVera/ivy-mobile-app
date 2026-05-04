import { Image, type ImageProps } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  Canvas,
  ColorMatrix,
  Image as SkiaImage,
  type DataSourceParam,
  useImage,
} from '@shopify/react-native-skia';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { computeSkiaImageDest, contentPositionToAnchors } from '@/components/ivy/skia-image-fit';

/** sRGB luminance — same weights browsers use for CSS `grayscale()`. */
const GRAYSCALE_COLOR_MATRIX = [
  0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0, 0, 0,
  1, 0,
];

/** Uniwind/Tailwind utility — CSS filter only applies on web. */
export const grayscaleBackdropWebClassName = 'grayscale';

function mergeWebImageClassName(className: string | undefined): string | undefined {
  if (Platform.OS !== 'web') return className;
  return [grayscaleBackdropWebClassName, className].filter(Boolean).join(' ');
}

function resolveSkiaDataSource(source: ImageProps['source']): DataSourceParam | undefined {
  if (source == null) return undefined;
  if (typeof source === 'number') return source;
  if (typeof source === 'string') return source;
  if (Array.isArray(source)) {
    if (source.length === 0) return undefined;
    return resolveSkiaDataSource(source[0] as ImageProps['source']);
  }
  if (typeof source === 'object' && 'uri' in source && typeof source.uri === 'string') {
    const uri = source.uri.trim();
    return uri.length > 0 ? uri : undefined;
  }
  return undefined;
}

export type GrayscaleCoverImageProps = Omit<ImageProps, 'style'> & {
  style?: ImageProps['style'];
  wrapStyle?: StyleProp<ViewStyle>;
};

type NativeSkiaGrayscaleCoverProps = {
  dataSource: DataSourceParam;
  style?: ImageProps['style'];
  wrapStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessible?: boolean;
  contentFit: NonNullable<ImageProps['contentFit']>;
  contentPosition: ImageProps['contentPosition'];
};

function NativeSkiaGrayscaleCover({
  dataSource,
  style,
  wrapStyle,
  accessibilityLabel,
  accessible,
  contentFit,
  contentPosition,
}: NativeSkiaGrayscaleCoverProps) {
  const skImage = useImage(dataSource);
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const flatStyle = useMemo(() => StyleSheet.flatten(style) ?? {}, [style]);
  const anchors = useMemo(() => contentPositionToAnchors(contentPosition), [contentPosition]);

  const dest =
    layout.width > 0 && layout.height > 0 && skImage
      ? computeSkiaImageDest(
          skImage.width(),
          skImage.height(),
          layout.width,
          layout.height,
          contentFit,
          anchors.ax,
          anchors.ay,
        )
      : null;

  return (
    <View
      collapsable={false}
      accessibilityLabel={accessibilityLabel}
      accessible={accessible ?? false}
      style={[StyleSheet.absoluteFillObject, wrapStyle, flatStyle]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setLayout((prev) =>
          prev.width === width && prev.height === height ? prev : { width, height },
        );
      }}
    >
      {dest && skImage ? (
        <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <SkiaImage
            image={skImage}
            x={dest.tx}
            y={dest.ty}
            width={dest.sw}
            height={dest.sh}
            fit="fill"
          >
            <ColorMatrix matrix={GRAYSCALE_COLOR_MATRIX} />
          </SkiaImage>
        </Canvas>
      ) : null}
    </View>
  );
}

/**
 * Full-bleed cover image with a grayscale treatment.
 *
 * - **Web:** Tailwind `grayscale` via Uniwind (`className`).
 * - **iOS / Android:** Skia draws the bitmap with a luminance color matrix (RN’s
 *   `filter` grayscale is unreliable on iOS, especially with `expo-image`).
 *
 * **`contentFit` / `contentPosition`:** forwarded to `expo-image` on web; on native,
 * Skia reproduces the same framing as CSS `object-fit` / `object-position`.
 *
 * Requires a **native rebuild** after installing `@shopify/react-native-skia`
 * (`npx expo run:ios` / EAS dev client).
 */
export function GrayscaleCoverImage({
  style,
  wrapStyle,
  className,
  source,
  contentFit = 'cover',
  contentPosition = 'center',
  ...rest
}: GrayscaleCoverImageProps) {
  if (Platform.OS === 'web') {
    return (
      <View collapsable={false} style={[StyleSheet.absoluteFillObject, wrapStyle]}>
        <Image
          {...rest}
          source={source}
          contentFit={contentFit}
          contentPosition={contentPosition}
          className={mergeWebImageClassName(className)}
          style={[StyleSheet.absoluteFillObject, style]}
        />
      </View>
    );
  }

  const skiaSource = resolveSkiaDataSource(source);
  if (skiaSource != null) {
    return (
      <NativeSkiaGrayscaleCover
        dataSource={skiaSource}
        style={style}
        wrapStyle={wrapStyle}
        accessibilityLabel={rest.accessibilityLabel}
        accessible={rest.accessible}
        contentFit={contentFit}
        contentPosition={contentPosition}
      />
    );
  }

  return (
    <View collapsable={false} style={[StyleSheet.absoluteFillObject, wrapStyle]}>
      <Image
        {...rest}
        source={source}
        contentFit={contentFit}
        contentPosition={contentPosition}
        className={className}
        style={[StyleSheet.absoluteFillObject, style]}
      />
    </View>
  );
}
