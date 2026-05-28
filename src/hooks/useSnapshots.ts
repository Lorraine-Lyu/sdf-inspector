import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { SnapshotEpochListing } from "../api/types";

export function useSnapshots(
  runId: string | null,
  experimentId: string | null,
  /** Bumping this forces a refetch — used to pick up new epochs after a
   *  `snapshot` WebSocket event. */
  refreshKey: number = 0
) {
  const [list, setList] = useState<SnapshotEpochListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!runId || !experimentId) {
      setList([]);
      return;
    }
    setLoading(true);
    api
      .listSnapshots(runId, experimentId)
      .then(setList)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [runId, experimentId]);

  useEffect(() => {
    refetch();
  }, [refetch, refreshKey]);

  return { list, loading, error, refetch };
}
