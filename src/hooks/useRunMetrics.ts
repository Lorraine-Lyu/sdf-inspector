import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { MetricsHistory } from "../api/types";
import { EMPTY_METRICS } from "../api/types";

export function useRunMetrics(
  runId: string | null,
  experimentId: string | null = null
) {
  const [metrics, setMetrics] = useState<MetricsHistory>(EMPTY_METRICS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) { setMetrics(EMPTY_METRICS); return; }
    setLoading(true);
    api.getRunMetrics(runId, undefined, undefined, experimentId)
      .then((m) => { setMetrics({ ...EMPTY_METRICS, ...m }); setError(null); })
      .catch((e: Error) => { setError(e.message); setMetrics(EMPTY_METRICS); })
      .finally(() => setLoading(false));
  }, [runId, experimentId]);

  return { metrics, loading, error };
}
