import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { SnapshotEpochDetail } from "../api/types";

export function useSnapshotDetail(
  runId: string | null,
  epoch: number | null,
  experimentId: string | null
) {
  const [detail, setDetail] = useState<SnapshotEpochDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId || epoch === null || !experimentId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .getSnapshotEpoch(runId, epoch, experimentId)
      .then(setDetail)
      .catch((e: Error) => {
        setError(e.message);
        setDetail(null);
      })
      .finally(() => setLoading(false));
  }, [runId, epoch, experimentId]);

  return { detail, loading, error };
}
