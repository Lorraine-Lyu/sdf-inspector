import { useCallback, useState } from "react";
import { api } from "../api/client";

/**
 * Fires POST /sync/pull. The pull runs server-side; completion arrives via the
 * `sync_complete` WebSocket event, so `syncing` here only reflects the request
 * round-trip — callers should rely on the WS event (and useSyncStatus) for the
 * authoritative in-progress state.
 */
export function useTriggerSync() {
  const [syncing, setSyncing] = useState(false);

  const trigger = useCallback(async () => {
    setSyncing(true);
    try {
      await api.triggerSync();
      return true;
    } catch {
      return false;
    } finally {
      setSyncing(false);
    }
  }, []);

  return { trigger, syncing };
}
