import { useEffect, useState } from "react";
import { api } from "../api/client";

/**
 * Fetches one page of scenes for a tier, optionally filtered by tags (AND).
 * Pagination/accumulation across pages is the caller's responsibility — this
 * hook only ever holds the page identified by (tier, tags, limit, offset).
 */
export function useScenesInTier(
  tier: string | null,
  selectedTags: string[] = [],
  limit = 50,
  offset = 0
) {
  const [scenes, setScenes] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagsKey = selectedTags.join(",");

  useEffect(() => {
    if (!tier) {
      setScenes([]);
      setTotal(0);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .listScenesInTier(tier, { tags: selectedTags, limit, offset })
      .then((r) => {
        if (cancelled) return;
        setScenes(r.scenes);
        setTotal(r.total);
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
    // tagsKey captures selectedTags content; eslint can't see through .join()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, tagsKey, limit, offset]);

  return { scenes, total, loading, error };
}
