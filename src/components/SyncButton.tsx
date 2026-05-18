import React, { useEffect, useRef } from "react";
import { useSyncStatus } from "../hooks/useSyncStatus";
import { useTriggerSync } from "../hooks/useTriggerSync";
import { useToast } from "./Toast";

function relativeTime(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

/**
 * Sync control shown next to the app title. Renders nothing unless sync is
 * configured server-side, so a server without sync support is a no-op.
 * Auto-triggers one pull on first mount (configured only).
 */
export function SyncButton() {
  const { status } = useSyncStatus();
  const { trigger, syncing: triggering } = useTriggerSync();
  const { addToast } = useToast();
  const autoSynced = useRef(false);

  const syncing = status.syncing || triggering;

  useEffect(() => {
    if (status.configured && !autoSynced.current) {
      autoSynced.current = true;
      addToast("Syncing with cloud…", "info");
      void trigger();
    }
  }, [status.configured, trigger, addToast]);

  if (!status.configured) return null;

  const last = relativeTime(status.last_sync);
  const title = last ? `Last sync: ${last}` : "Sync with cloud";

  return (
    <button
      onClick={() => void trigger()}
      disabled={syncing}
      title={title}
      style={{ ...s.btn, ...(syncing ? s.btnDisabled : {}) }}
    >
      {syncing ? "Syncing…" : "⟳ Sync"}
    </button>
  );
}

const s: Record<string, React.CSSProperties> = {
  btn: {
    marginTop: 8,
    width: "100%",
    padding: "6px 10px",
    fontSize: 12,
    background: "#2f2f2f",
    border: "1px solid #3f3f3f",
    borderRadius: 6,
    color: "#ececec",
    cursor: "pointer",
  },
  btnDisabled: {
    color: "#8e8ea0",
    cursor: "not-allowed",
  },
};
