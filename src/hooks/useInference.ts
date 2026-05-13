import { useCallback, useState } from "react";
import { api } from "../api/client";
import type { InferencePrediction, InferenceRequest } from "../api/types";

export function useInference() {
  const [result, setResult] = useState<InferencePrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (request: InferenceRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.runInference(request);
      setResult(response);
      return response;
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { predict, result, loading, error, reset };
}
