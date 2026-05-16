import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { SlotDiagnostic } from "../api/types";

export function useSlotDiagnostic(
  runId: string | null,
  epoch: number | null,
  experimentId: string | null
) {
  const [data, setData] = useState<SlotDiagnostic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId || epoch === null || !experimentId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .getSlotDiagnostic(runId, epoch, experimentId)
      .then(setData)
      .catch((e: Error) => {
        setError(e.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [runId, epoch, experimentId]);

  return { diagnostic: data, loading, error };
}
