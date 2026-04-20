import { View } from 'react-native';

import { useCountdown } from '@/hooks/use-countdown';

import { IvyText } from './ivy-text';

type LiveCountdownProps = {
  /** ISO string or Date the event starts at. */
  target: string | Date;
  /** Visual variant. `compact` for inline home cards, `large` for the dedicated live screen. */
  size?: 'compact' | 'large';
};

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}

export function LiveCountdown({ target, size = 'compact' }: LiveCountdownProps) {
  const { days, hours, minutes, seconds, elapsed } = useCountdown(target);

  if (elapsed) return null;

  const parts = [
    { value: days, label: days === 1 ? 'day' : 'days' },
    { value: hours, label: 'hr' },
    { value: minutes, label: 'min' },
    { value: seconds, label: 'sec' },
  ];

  if (size === 'large') {
    return (
      <View className="flex-row items-end justify-center gap-3">
        {parts.map((p) => (
          <View key={p.label} className="items-center">
            <IvyText className="text-4xl font-bold tabular-nums text-zinc-900 dark:text-white">
              {pad(p.value)}
            </IvyText>
            <IvyText className="mt-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {p.label}
            </IvyText>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-2">
      {parts.map((p, i) => (
        <View key={p.label} className="flex-row items-baseline">
          <IvyText className="text-base font-semibold tabular-nums text-zinc-900 dark:text-white">
            {pad(p.value)}
          </IvyText>
          <IvyText className="ml-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {p.label}
          </IvyText>
          {i < parts.length - 1 ? (
            <IvyText className="mx-1 text-base text-zinc-400 dark:text-zinc-600">
              ·
            </IvyText>
          ) : null}
        </View>
      ))}
    </View>
  );
}
