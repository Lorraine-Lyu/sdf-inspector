import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Reconstruction } from "../api/types";

export function useReconstruction(sceneId: string, runId: string | null, checkpointId?: string) {
  const [reconstruction, setReconstruction] = useState<Reconstruction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) {
      setReconstruction(null);
      return;
    }
    setLoading(true);
    setError(null);
    api.getReconstruction(sceneId, runId, checkpointId)
      .then(setReconstruction)
      .catch((e: Error) => {
        setReconstruction(null);
        if (!e.message.includes("404")) setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [sceneId, runId, checkpointId]);

  return { reconstruction, loading, error };
}
