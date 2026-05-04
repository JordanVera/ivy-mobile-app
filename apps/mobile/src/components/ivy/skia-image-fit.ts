import type { ImageContentPositionValue, ImageProps } from 'expo-image';

type ContentFit = NonNullable<ImageProps['contentFit']>;
type ContentPosition = ImageProps['contentPosition'];

/** Maps expo-image `contentPosition` shorthand → focal anchors for crop/placement (0–1). */
const POSITION_STRING_MAP: Record<string, { ax: number; ay: number }> = {
  center: { ax: 0.5, ay: 0.5 },
  top: { ax: 0.5, ay: 0 },
  bottom: { ax: 0.5, ay: 1 },
  left: { ax: 0, ay: 0.5 },
  right: { ax: 1, ay: 0.5 },
  'top center': { ax: 0.5, ay: 0 },
  'top left': { ax: 0, ay: 0 },
  'top right': { ax: 1, ay: 0 },
  'right center': { ax: 1, ay: 0.5 },
  'right top': { ax: 1, ay: 0 },
  'right bottom': { ax: 1, ay: 1 },
  'bottom center': { ax: 0.5, ay: 1 },
  'bottom left': { ax: 0, ay: 1 },
  'bottom right': { ax: 1, ay: 1 },
  'left center': { ax: 0, ay: 0.5 },
  'left top': { ax: 0, ay: 0 },
  'left bottom': { ax: 0, ay: 1 },
};

function edgeValueToAnchor(
  value: ImageContentPositionValue | undefined,
  /** Anchor when value pins content flush to that corner edge (0 or 1). */
  flushAnchor: 0 | 1,
): number {
  if (value === undefined || value === 'center') return 0.5;
  if (typeof value === 'number') return flushAnchor;
  if (typeof value === 'string') {
    if (value === 'center') return 0.5;
    if (value.endsWith('%')) {
      const n = parseFloat(value);
      return Number.isFinite(n) ? Math.min(1, Math.max(0, n / 100)) : 0.5;
    }
    const n = parseFloat(value);
    if (Number.isFinite(n)) return Math.min(1, Math.max(0, n / 100));
  }
  return 0.5;
}

/**
 * Mirrors expo-image / CSS `object-position` focal point as anchors used for
 * `cover`/`contain` placement inside a fixed frame.
 */
export function contentPositionToAnchors(position: ContentPosition | undefined): {
  ax: number;
  ay: number;
} {
  if (position == null || position === 'center') {
    return { ax: 0.5, ay: 0.5 };
  }

  if (typeof position === 'string') {
    return POSITION_STRING_MAP[position] ?? { ax: 0.5, ay: 0.5 };
  }

  if ('top' in position && 'left' in position) {
    return {
      ax: edgeValueToAnchor(position.left, 0),
      ay: edgeValueToAnchor(position.top, 0),
    };
  }
  if ('top' in position && 'right' in position) {
    return {
      ax: edgeValueToAnchor(position.right, 1),
      ay: edgeValueToAnchor(position.top, 0),
    };
  }
  if ('bottom' in position && 'left' in position) {
    return {
      ax: edgeValueToAnchor(position.left, 0),
      ay: edgeValueToAnchor(position.bottom, 1),
    };
  }
  if ('bottom' in position && 'right' in position) {
    return {
      ax: edgeValueToAnchor(position.right, 1),
      ay: edgeValueToAnchor(position.bottom, 1),
    };
  }

  return { ax: 0.5, ay: 0.5 };
}

/** Destination rect for Skia (uniform scale except `fill`). */
export function computeSkiaImageDest(
  iw: number,
  ih: number,
  cw: number,
  ch: number,
  contentFit: ContentFit,
  ax: number,
  ay: number,
): { tx: number; ty: number; sw: number; sh: number } {
  if (!(cw > 0 && ch > 0)) {
    return { tx: 0, ty: 0, sw: cw, sh: ch };
  }
  if (!(iw > 0 && ih > 0)) {
    return { tx: 0, ty: 0, sw: cw, sh: ch };
  }

  switch (contentFit) {
    case 'cover': {
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const ox = Math.max(0, sw - cw);
      const oy = Math.max(0, sh - ch);
      return { tx: -ox * ax, ty: -oy * ay, sw, sh };
    }
    case 'contain': {
      const scale = Math.min(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const gx = Math.max(0, cw - sw);
      const gy = Math.max(0, ch - sh);
      return { tx: gx * ax, ty: gy * ay, sw, sh };
    }
    case 'fill':
      return { tx: 0, ty: 0, sw: cw, sh: ch };
    case 'none': {
      const gx = Math.max(0, cw - iw);
      const gy = Math.max(0, ch - ih);
      return { tx: gx * ax, ty: gy * ay, sw: iw, sh: ih };
    }
    case 'scale-down': {
      const containScale = Math.min(cw / iw, ch / ih);
      const scale = Math.min(1, containScale);
      const sw = iw * scale;
      const sh = ih * scale;
      const gx = Math.max(0, cw - sw);
      const gy = Math.max(0, ch - sh);
      return { tx: gx * ax, ty: gy * ay, sw, sh };
    }
    default: {
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const ox = Math.max(0, sw - cw);
      const oy = Math.max(0, sh - ch);
      return { tx: -ox * ax, ty: -oy * ay, sw, sh };
    }
  }
}
