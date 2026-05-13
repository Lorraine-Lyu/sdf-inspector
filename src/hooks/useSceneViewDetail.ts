import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { SceneViewDetail } from "../api/types";

export function useSceneViewDetail(tier: string | null, scene: string | null) {
  const [detail, setDetail] = useState<SceneViewDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tier || !scene) {
      setDetail(null);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .getSceneViewDetail(tier, scene)
      .then(setDetail)
      .catch((e: Error) => {
        setError(e.message);
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [tier, scene]);

  return { detail, loading, error };
}
