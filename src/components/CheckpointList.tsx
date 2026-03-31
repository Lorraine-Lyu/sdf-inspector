import React, { useState } from "react";
import type { CheckpointMeta, Experiment } from "../api/types";
import { EvaluateDialog } from "./EvaluateDialog";
import { ForkRunDialog } from "./ForkRunDialog";

interface CheckpointListProps {
  checkpoints: CheckpointMeta[];
  runId: string;
  experimentId: string;
  experiments: Experiment[];
  onForked: () => void;
}

export function CheckpointList({ checkpoints, runId, experimentId, experiments, onForked }: CheckpointListProps) {
  const [evaluateCheckpoint, setEvaluateCheckpoint] = useState<string | null>(null);
  const [forkCheckpoint, setForkCheckpoint] = useState<string | null>(null);

  if (checkpoints.length === 0) {
    return <div style={s.empty}>No checkpoints yet</div>;
  }

  return (
    <>
      <div style={s.table}>
        <div style={s.headerRow}>
          <span style={s.th}>Checkpoint</span>
          <span style={s.th}>Epoch</span>
          <span style={s.th}>Val Loss</span>
          <span style={s.th}>Created</span>
          <span style={s.th}>Actions</span>
        </div>
        {[...checkpoints].reverse().map((c) => (
          <div key={c.id} style={s.row}>
            <span style={s.mono}>{c.id}</span>
            <span style={s.cell}>{c.epoch}</span>
            <span style={s.cell}>{c.val_loss.toFixed(4)}</span>
            <span style={s.cell}>{new Date(c.created_at).toLocaleString()}</span>
            <span style={s.actions}>
              <button style={s.btn} onClick={() => setEvaluateCheckpoint(c.id)}>Evaluate</button>
              <button style={s.btn} onClick={() => setForkCheckpoint(c.id)}>Fork</button>
            </span>
          </div>
        ))}
      </div>

      {evaluateCheckpoint && (
        <EvaluateDialog
          checkpointId={evaluateCheckpoint}
          onClose={() => setEvaluateCheckpoint(null)}
        />
      )}
      {forkCheckpoint && (
        <ForkRunDialog
          checkpointId={forkCheckpoint}
          sourceRunId={runId}
          defaultExperimentId={experimentId}
          experiments={experiments}
          onClose={() => setForkCheckpoint(null)}
          onForked={onForked}
        />
      )}
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  table: { display: "flex", flexDirection: "column", gap: 0 },
  headerRow: { display: "grid", gridTemplateColumns: "1fr 80px 90px 160px 160px", gap: 8, padding: "6px 8px", marginBottom: 2 },
  th: { fontSize: 11, color: "#565869", textTransform: "uppercase", letterSpacing: "0.05em" },
  row: { display: "grid", gridTemplateColumns: "1fr 80px 90px 160px 160px", gap: 8, padding: "8px 8px", borderTop: "1px solid #3f3f3f", alignItems: "center" },
  mono: { fontSize: 12, color: "#10a37f", fontFamily: "ui-monospace, monospace" },
  cell: { fontSize: 13, color: "#8e8ea0" },
  actions: { display: "flex", gap: 6 },
  btn: { padding: "4px 10px", fontSize: 12, background: "transparent", border: "1px solid #3f3f3f", borderRadius: 6, color: "#8e8ea0", cursor: "pointer" },
  empty: { color: "#565869", fontSize: 13, padding: "16px 0" },
};
