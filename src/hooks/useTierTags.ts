import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { TierTag } from "../api/types";

export function useTierTags(tier: string | null) {
  const [tags, setTags] = useState<TierTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tier) {
      setTags([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .listTierTags(tier)
      .then((r) => {
        if (!cancelled) setTags(r.tags);
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
  }, [tier]);

  return { tags, loading, error };
}
