import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import type { SyncStatus } from "../api/types";

const NOT_CONFIGURED: SyncStatus = {
  configured: false,
  syncing: false,
  last_sync: null,
  last_result: null,
};

/**
 * Polls GET /sync/status: once on mount, then every 5s while a sync is in
 * progress. If the endpoint is missing/unreachable (server without sync
 * support) we report `configured: false` so the UI hides all sync affordances
 * and behaves exactly as before.
 */
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>(NOT_CONFIGURED);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = useCallback(() => {
    api
      .getSyncStatus()
      .then((s) => setStatus(s))
      .catch(() => setStatus(NOT_CONFIGURED));
  }, []);

  useEffect(() => {
    poll();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [poll]);

  useEffect(() => {
    if (!status.syncing) return;
    timer.current = setTimeout(poll, 5000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [status.syncing, status.last_sync, poll]);

  return { status, refetch: poll };
}
