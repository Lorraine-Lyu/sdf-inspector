import { useEffect, useState } from "react";
import { api } from "../api/client";

export function useGroundTruthGlsl(tier: string | null, scene: string | null) {
  const [glsl, setGlsl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tier || !scene) {
      setGlsl(null);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .getGroundTruthGlsl(tier, scene)
      .then((r) => setGlsl(r.glsl))
      .catch((e: Error) => {
        setError(e.message);
        setGlsl(null);
      })
      .finally(() => setLoading(false));
  }, [tier, scene]);

  return { glsl, loading, error };
}
