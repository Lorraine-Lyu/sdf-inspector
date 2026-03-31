import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { RunConfig } from "../api/types";

export function useRuns(experimentId: string | null) {
  const [runs, setRuns] = useState<RunConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!experimentId) { setRuns([]); return; }
    setLoading(true);
    api.listRuns(experimentId)
      .then((r) => { setRuns(r); setError(null); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [experimentId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { runs, loading, error, refetch: fetch };
}
