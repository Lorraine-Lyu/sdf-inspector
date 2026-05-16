import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { ExperimentDetail } from "../api/types";

export function useExperimentDetail(experimentId: string | null) {
  const [detail, setDetail] = useState<ExperimentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!experimentId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getExperiment(experimentId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message);
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [experimentId]);

  return { detail, loading, error };
}
