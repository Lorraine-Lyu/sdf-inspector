import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { CheckpointMeta } from "../api/types";

export function useCheckpoints(
  runId: string | null,
  experimentId: string | null
) {
  const [checkpoints, setCheckpoints] = useState<CheckpointMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!runId || !experimentId) { setCheckpoints([]); return; }
    setLoading(true);
    api.listCheckpoints(runId, experimentId)
      .then((c) => { setCheckpoints(c); setError(null); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [runId, experimentId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { checkpoints, loading, error, refetch: fetch };
}
