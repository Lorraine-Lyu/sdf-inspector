import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import type { StatusEvent, TrainingStatus } from "../api/types";

export function useTrainingStatus() {
  const [status, setStatus] = useState<TrainingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const s = await api.getTrainingStatus();
      setStatus(s);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  /** Replace the whole status when a `status` event arrives — the websocket
   *  rebroadcasts the full data/status.json contents. */
  const applyStatusEvent = useCallback((ev: StatusEvent) => {
    const { type: _type, ...rest } = ev;
    setStatus((prev) => ({ ...(prev ?? ({} as TrainingStatus)), ...rest }));
  }, []);

  /** Fold one row of metrics into the status fields the dashboard cares about. */
  const applyMetricsUpdate = useCallback((update: Partial<TrainingStatus>) => {
    setStatus((prev) => (prev ? { ...prev, ...update } : prev));
  }, []);

  return { status, error, refetch: fetch, applyStatusEvent, applyMetricsUpdate };
}

export type TrainingStatusHook = ReturnType<typeof useTrainingStatus>;

// Poll fallback (used when WS unavailable).
export function useTrainingStatusPolled(intervalMs = 2000) {
  const hook = useTrainingStatus();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(hook.refetch, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hook.refetch, intervalMs]);

  return hook;
}
