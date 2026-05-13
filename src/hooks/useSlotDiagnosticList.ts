import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { SlotDiagnosticListing } from "../api/types";

export function useSlotDiagnosticList(runId: string | null) {
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
      .listSlotDiagnostics(runId)
      .then(setList)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [runId]);

  return { list, loading, error };
}
