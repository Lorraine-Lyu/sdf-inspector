import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import type { CurriculumEvent, StatusEvent, TrainingStatus } from "../api/types";

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

  const applyStatusEvent = useCallback((ev: StatusEvent) => {
    setStatus((prev) =>
      prev ? { ...prev, state: ev.state } : prev
    );
  }, []);

  const applyCurriculumEvent = useCallback((ev: CurriculumEvent) => {
    setStatus((prev) =>
      prev ? { ...prev, curriculum_tier: ev.tier } : prev
    );
  }, []);

  const applyMetricsUpdate = useCallback(
    (epoch: number, loss: number, val_loss: number, lr: number) => {
      setStatus((prev) =>
        prev ? { ...prev, epoch, loss, val_loss, lr } : prev
      );
    },
    []
  );

  const refetch = fetch;

  return { status, error, refetch, applyStatusEvent, applyCurriculumEvent, applyMetricsUpdate };
}

export type TrainingStatusHook = ReturnType<typeof useTrainingStatus>;

// Poll interval fallback (used if WS unavailable)
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
