import React, { useState } from "react";
import type { RunDetail } from "../api/types";

interface ConfigDiffProps {
  runA: RunDetail;
  runB: RunDetail;
}

type ConfigRow = { field: string; a: string; b: string; differs: boolean };

function flattenConfig(run: RunDetail): Record<string, string> {
  const c = run.config;
  return {
    "Model Architecture": c.model_architecture ?? "—",
    "Learning Rate": String(c.learning_rate),
    "Batch Size": String(c.batch_size),
    "LR Schedule": c.lr_schedule,
    "Loss: SDF": String(c.loss_weights.sdf),
    "Loss: Eikonal": String(c.loss_weights.eikonal),
    "Loss: Regularization": String(c.loss_weights.regularization),
    "Max Epochs": String(c.max_epochs),
    "Curriculum Auto": c.curriculum_auto_advance ? "yes" : "no",
    "Curriculum Threshold": String(c.curriculum_threshold),
    "Git Commit": run.git_commit ?? "—",
    "Git Dirty": run.git_dirty ? "yes" : "no",
    "Created At": new Date(run.created_at).toLocaleString(),
  };
}

export function ConfigDiff({ runA, runB }: ConfigDiffProps) {
  const [showAll, setShowAll] = useState(false);
  const flatA = flattenConfig(runA);
  const flatB = flattenConfig(runB);

  const rows: ConfigRow[] = Object.keys(flatA).map((field) => ({
    field,
    a: flatA[field],
    b: flatB[field] ?? "—",
    differs: flatA[field] !== flatB[field],
  }));

  const visible = showAll ? rows : rows.filter((r) => r.differs);

  return (
    <div>
      <div style={s.header}>
        <span style={s.col} />
        <span style={{ ...s.col, color: "#ececec", fontWeight: 500 }}>{runA.id}</span>
        <span style={{ ...s.col, color: "#ececec", fontWeight: 500 }}>{runB.id}</span>
      </div>
      {visible.length === 0 && !showAll && (
        <div style={s.empty}>Configs are identical</div>
      )}
      {visible.map((row) => (
        <div key={row.field} style={s.row}>
          <span style={s.fieldCell}>{row.field}</span>
          <span style={{ ...s.valueCell, background: row.differs ? "#3b1f1f" : "transparent", color: row.differs ? "#fca5a5" : "#8e8ea0" }}>{row.a}</span>
          <span style={{ ...s.valueCell, background: row.differs ? "#1a3b2a" : "transparent", color: row.differs ? "#6ee7b7" : "#8e8ea0" }}>{row.b}</span>
        </div>
      ))}
      <button style={s.toggleBtn} onClick={() => setShowAll((v) => !v)}>
        {showAll ? "Show differences only" : `Show all fields (${rows.length})`}
      </button>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: { display: "grid", gridTemplateColumns: "160px 1fr 1fr", gap: 8, padding: "6px 0", marginBottom: 4 },
  col: { fontSize: 11, color: "#565869", textTransform: "uppercase", letterSpacing: "0.05em" },
  row: { display: "grid", gridTemplateColumns: "160px 1fr 1fr", gap: 8, padding: "5px 0", borderTop: "1px solid #3f3f3f" },
  fieldCell: { fontSize: 12, color: "#8e8ea0", alignSelf: "center" },
  valueCell: { fontSize: 12, fontFamily: "ui-monospace, monospace", padding: "3px 6px", borderRadius: 4 },
  empty: { fontSize: 13, color: "#565869", padding: "16px 0" },
  toggleBtn: { marginTop: 12, background: "transparent", border: "1px solid #3f3f3f", borderRadius: 6, color: "#8e8ea0", padding: "4px 10px", fontSize: 12, cursor: "pointer" },
};
