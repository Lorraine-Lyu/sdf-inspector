import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { MetricsHistory } from "../api/types";

const EMPTY: MetricsHistory = {
  epochs: [], train_loss: [], val_loss: [], lr: [],
  component_losses: { sdf: [], eikonal: [], regularization: [] },
  curriculum_tier: [],
};

export function useRunMetrics(runId: string | null) {
  const [metrics, setMetrics] = useState<MetricsHistory>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) { setMetrics(EMPTY); return; }
    setLoading(true);
    api.getRunMetrics(runId)
      .then((m) => { setMetrics(m); setError(null); })
      .catch((e: Error) => { setError(e.message); setMetrics(EMPTY); })
      .finally(() => setLoading(false));
  }, [runId]);

  return { metrics, loading, error };
}
