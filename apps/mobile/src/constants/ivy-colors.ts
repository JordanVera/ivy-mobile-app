/**
 * Single source of truth for Ivy brand colors used in TypeScript / JSX
 * `color` props (e.g. <IconSymbol color={...} />, tab bar tints, gradients).
 *
 * For Tailwind / NativeWind utility classes, use the matching tokens defined
 * in `src/global.css` (e.g. `text-ivy-accent`, `bg-ivy-accent/20`). When you
 * change the hex below, also update `--color-ivy-accent` in `global.css` so
 * both layers stay in sync.
 */
export const IvyColors = {
  /** Primary brand accent (mint green). */
  accent: '#00FA9A',
} as const;
