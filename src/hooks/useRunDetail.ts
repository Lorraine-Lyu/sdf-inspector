import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { RunDetail } from "../api/types";

export function useRunDetail(
  runId: string | null,
  experimentId: string | null
) {
  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId || !experimentId) { setRun(null); return; }
    setLoading(true);
    api.getRun(runId, experimentId)
      .then((r) => { setRun(r); setError(null); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [runId, experimentId]);

  return { run, loading, error };
}
