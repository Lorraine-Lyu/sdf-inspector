import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { TierListing } from "../api/types";

export function useTiers() {
  const [data, setData] = useState<TierListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .listTiers()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { tiers: data?.tiers ?? [], loading, error };
}
