import { useEffect, useMemo, useState } from 'react';

export type Countdown = {
  /** Total milliseconds remaining until the target. Negative if the target is in the past. */
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once `totalMs <= 0`. */
  elapsed: boolean;
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function computeCountdown(targetMs: number, nowMs: number): Countdown {
  const total = targetMs - nowMs;
  if (total <= 0) {
    return {
      totalMs: total,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      elapsed: true,
    };
  }
  const days = Math.floor(total / DAY);
  const hours = Math.floor((total % DAY) / HOUR);
  const minutes = Math.floor((total % HOUR) / MINUTE);
  const seconds = Math.floor((total % MINUTE) / SECOND);
  return { totalMs: total, days, hours, minutes, seconds, elapsed: false };
}

/**
 * Countdown to the given target date. Ticks once per second while mounted.
 * Pass `null` to disable (returns a zeroed/elapsed value).
 */
export function useCountdown(target: Date | string | null | undefined): Countdown {
  const targetMs = useMemo(() => {
    if (!target) return null;
    const d = typeof target === 'string' ? new Date(target) : target;
    const ms = d.getTime();
    return Number.isFinite(ms) ? ms : null;
  }, [target]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (targetMs == null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (targetMs == null) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      elapsed: true,
    };
  }

  return computeCountdown(targetMs, now);
}
