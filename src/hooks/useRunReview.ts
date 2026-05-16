import { useEffect, useState } from "react";
import { api } from "../api/client";

/**
 * Fetches a run's review.md. Only requests when `enabled` (the Review tab is
 * active) so unopened tabs don't trigger network calls. `content` is null
 * both before loading and when the run has no review — callers should rely on
 * `loaded` to distinguish "no review" from "not fetched yet".
 */
export function useRunReview(runId: string | null, enabled: boolean) {
  const [content, setContent] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId || !enabled) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getRunReview(runId)
      .then((r) => {
        if (cancelled) return;
        setContent(r.content);
        setLoaded(true);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [runId, enabled]);

  return { content, loaded, loading, error };
}
