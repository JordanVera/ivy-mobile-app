/**
 * Single source of truth for Ivy brand colors used in TypeScript / JSX
 * `color` props (e.g. <IconSymbol color={...} />, tab bar tints, gradients).
 *
 * For Tailwind / NativeWind utility classes, use the matching tokens defined
 * in `src/global.css` (e.g. `text-ivy-accent`, `bg-ivy-accent/20`). When you
 * change the hex below (`IVY_ACCENT`), also update `--color-ivy-accent` in
 * `global.css` so both layers stay in sync. For solid `bg-ivy-accent` buttons, use
 * `text-zinc-900` / `IvyColors.onAccent` for readable foreground.
 */
const IVY_ACCENT = '#00FA9A';

export const IvyColors = {
  /** Primary brand accent (mint green). */
  accent: IVY_ACCENT,
  /** Text and icons on solid accent fills (high contrast on mint). */
  onAccent: '#18181b',
  /** Horizontal LinearGradient stops for primary CTAs (deep mint → accent → deep mint). */
  accentGradient: ['#009a65', IVY_ACCENT, '#009a65'] as const,
} as const;
