import { useEffect, useState } from "react";
import { api } from "../api/client";

export function useScenesInTier(tier: string | null) {
  const [scenes, setScenes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tier) {
      setScenes([]);
      return;
    }
    setLoading(true);
    api
      .listScenesInTier(tier)
      .then((r) => setScenes(r.scenes))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tier]);

  return { scenes, loading, error };
}
