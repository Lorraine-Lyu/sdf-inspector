import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { SlotDiagnosticListing } from "../api/types";

export function useSlotDiagnosticList(
  runId: string | null,
  experimentId: string | null = null
) {
  const [list, setList] = useState<SlotDiagnosticListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) {
      setList([]);
      return;
    }
    setLoading(true);
    api
      .listSlotDiagnostics(runId, experimentId)
      .then(setList)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [runId, experimentId]);

  return { list, loading, error };
}
