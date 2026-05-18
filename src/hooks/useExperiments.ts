import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { Experiment } from "../api/types";

export function useExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    api.listExperiments()
      .then((exps) => { setExperiments(exps); setError(null); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Cloud sync completing can add/remove experiments; App dispatches this
  // window event on the `sync_complete` WS message so any mounted list
  // refreshes without prop-drilling a refetch handler.
  useEffect(() => {
    window.addEventListener("experiments:refetch", fetch);
    return () => window.removeEventListener("experiments:refetch", fetch);
  }, [fetch]);

  return { experiments, loading, error, refetch: fetch };
}
