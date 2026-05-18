import { useCallback, useState } from "react";
import { api } from "../api/client";

/**
 * POST /sync/checkpoint to pull a single checkpoint's weights from cloud.
 * `fetching` tracks the in-flight checkpoint by its file name so a list can
 * show a spinner only on the row being fetched.
 */
export function useFetchCheckpoint() {
  const [fetchingFile, setFetchingFile] = useState<string | null>(null);

  const fetch = useCallback(
    async (expId: string, runId: string, checkpointFile: string) => {
      setFetchingFile(checkpointFile);
      try {
        await api.fetchCheckpoint(expId, runId, checkpointFile);
        return true;
      } catch {
        return false;
      } finally {
        setFetchingFile(null);
      }
    },
    []
  );

  return { fetch, fetchingFile, fetching: fetchingFile !== null };
}
