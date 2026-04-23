/**
 * Local hero photos used as posters in the Watch feed instead of the YouTube
 * thumbnails, whose 16:9 aspect ratio and composition don't play well with the
 * portrait-first Vogue-style cover layout.
 *
 * Each video is mapped to a stable poster by hashing its `videoId`, so the
 * same episode always shows the same cover photo across launches.
 */

// `require` in React Native / Metro returns an opaque asset id (number) for
// local files, which `expo-image` accepts directly as a `source` value.
//
// Important: keep these filenames lowercased – Metro's `assetExts` matcher is
// case-sensitive, so `.JPG`/`.JPEG` would be parsed as JS source instead of
// bundled as an image.
const FEATURED_POSTER = require('@/assets/video-heroes/bloom-hero.jpg');

const STACK_POSTERS: readonly number[] = [
  require('@/assets/video-heroes/hero-2.jpeg'),
  require('@/assets/video-heroes/hero-3.jpeg'),
  require('@/assets/video-heroes/hero-4.jpeg'),
  require('@/assets/video-heroes/hero-5.jpeg'),
  require('@/assets/video-heroes/hero-6.jpeg'),
];

export function getFeaturedPoster(): number {
  return FEATURED_POSTER;
}

export function getStackPosterForVideoId(videoId: string | null | undefined): number {
  const id = videoId?.trim() ?? '';
  if (!id || STACK_POSTERS.length === 0) return STACK_POSTERS[0];
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum = (sum + id.charCodeAt(i)) % STACK_POSTERS.length;
  }
  return STACK_POSTERS[sum];
}
