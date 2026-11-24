'use client';

import { useEffect, useState } from 'react';
export { formatDuration } from '@/lib/format';

interface UseGameTimerOptions {
  dataInicio: string | null;
  serverNow: string | null;
  isRunning: boolean;
  finalElapsedSeconds?: number | null;
}

export function useGameTimer({
  dataInicio,
  serverNow,
  isRunning,
  finalElapsedSeconds,
}: UseGameTimerOptions): number {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (typeof finalElapsedSeconds === 'number') {
      setElapsedSeconds(finalElapsedSeconds);
      return;
    }

    if (!dataInicio || !isRunning) {
      setElapsedSeconds(0);
      return;
    }

    const startMs = new Date(dataInicio).getTime();
    const serverMs = serverNow ? new Date(serverNow).getTime() : Date.now();
    const clockOffsetMs = serverMs - Date.now();

    const update = () => {
      const nowServerEstimated = Date.now() + clockOffsetMs;
      const diff = Math.max(0, (nowServerEstimated - startMs) / 1000);
      setElapsedSeconds(diff);
    };

    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [dataInicio, serverNow, isRunning, finalElapsedSeconds]);

  return elapsedSeconds;
}
