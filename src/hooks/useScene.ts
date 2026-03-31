import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { SceneDefinition } from "../api/types";

export function useScene(sceneId: string) {
  const [scene, setScene] = useState<SceneDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getScene(sceneId)
      .then(setScene)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sceneId]);

  return { scene, loading, error };
}
