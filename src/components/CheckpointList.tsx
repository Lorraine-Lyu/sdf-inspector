import React from "react";
import type { CheckpointMeta } from "../api/types";
import { Link } from "react-router-dom";
import { useFetchCheckpoint } from "../hooks/useFetchCheckpoint";
import { useToast } from "./Toast";

interface CheckpointListProps {
  checkpoints: CheckpointMeta[];
  runId: string;
  experimentId: string | null;
  locality?: "local" | "remote";
  /** Called after a successful cloud fetch so the parent can refetch the list. */
  onFetched?: () => void;
}

export function CheckpointList({
  checkpoints,
  runId,
  experimentId,
  locality,
  onFetched,
}: CheckpointListProps) {
  const { fetch, fetchingFile } = useFetchCheckpoint();
  const { addToast } = useToast();
  const isRemote = locality === "remote";

  if (checkpoints.length === 0) {
    return <div style={s.empty}>No checkpoints yet</div>;
  }

  const handleFetch = async (file: string) => {
    if (!experimentId) {
      addToast("Cannot fetch: experiment unknown", "error");
      return;
    }
    const ok = await fetch(experimentId, runId, file);
    if (ok) {
      addToast(`Fetched ${file}`, "success");
      onFetched?.();
    } else {
      addToast(`Failed to fetch ${file}`, "error");
    }
  };

  return (
    <div style={s.table}>
      <div style={s.headerRow}>
        <span style={s.th}>Checkpoint</span>
        <span style={s.th}>Epoch</span>
        <span style={s.th}>Val Loss</span>
        <span style={s.th}>Weights</span>
        <span style={s.th}>Actions</span>
      </div>
      {[...checkpoints].reverse().map((c) => {
        const expParam = experimentId
          ? `&experiment=${encodeURIComponent(experimentId)}`
          : "";
        const playgroundUrl = `/playground?run=${encodeURIComponent(runId)}&checkpoint=${encodeURIComponent(c.id)}${expParam}`;
        const file = c.id.endsWith(".pt") ? c.id : `${c.id}.pt`;
        const fetching = fetchingFile === file;

        return (
          <div key={c.id} style={s.row}>
            <span style={s.mono}>{c.id}</span>
            <span style={s.cell}>{c.epoch}</span>
            <span style={s.cell}>
              {c.val_loss !== null && c.val_loss !== undefined ? c.val_loss.toFixed(4) : "—"}
            </span>
            <span style={s.cell}>
              {c.has_weights ? (
                <span style={s.weightYes}>● on disk</span>
              ) : isRemote ? (
                <span style={s.weightNo}>☁ cloud</span>
              ) : (
                <span style={s.weightNo}>○ missing</span>
              )}
            </span>
            <span style={s.actions}>
              {c.has_weights ? (
                <Link to={playgroundUrl} style={s.btn}>
                  Open in Playground
                </Link>
              ) : isRemote ? (
                <button
                  style={{ ...s.btn, ...(fetching ? s.btnDisabled : {}) }}
                  disabled={fetching}
                  onClick={() => void handleFetch(file)}
                >
                  {fetching ? "Fetching…" : "↓ Fetch"}
                </button>
              ) : (
                <span style={{ ...s.btn, color: "#565869", borderColor: "#3f3f3f" }}>
                  deleted
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  table: { display: "flex", flexDirection: "column", gap: 0 },
  headerRow: {
    display: "grid",
    gridTemplateColumns: "1fr 80px 100px 110px 200px",
    gap: 8,
    padding: "6px 8px",
    marginBottom: 2,
  },
  th: {
    fontSize: 11,
    color: "#565869",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 80px 100px 110px 200px",
    gap: 8,
    padding: "8px 8px",
    borderTop: "1px solid #3f3f3f",
    alignItems: "center",
  },
  mono: { fontSize: 12, color: "#10a37f", fontFamily: "ui-monospace, monospace" },
  cell: { fontSize: 13, color: "#8e8ea0" },
  actions: { display: "flex", gap: 6 },
  btn: {
    padding: "4px 10px",
    fontSize: 12,
    background: "transparent",
    border: "1px solid #3f3f3f",
    borderRadius: 6,
    color: "#8e8ea0",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  },
  btnDisabled: { color: "#565869", cursor: "not-allowed" },
  weightYes: { fontSize: 12, color: "#10a37f" },
  weightNo: { fontSize: 12, color: "#565869" },
  empty: { color: "#565869", fontSize: 13, padding: "16px 0" },
};
