import React, { useCallback, useState } from "react";
import { api } from "../api/client";
import type { Experiment } from "../api/types";
import { useToast } from "./Toast";

interface ForkRunDialogProps {
  checkpointId: string;
  sourceRunId: string;
  defaultExperimentId: string;
  experiments: Experiment[];
  onClose: () => void;
  onForked: () => void;
}

export function ForkRunDialog({ checkpointId, sourceRunId, defaultExperimentId, experiments, onClose, onForked }: ForkRunDialogProps) {
  const { addToast } = useToast();
  const [targetExpId, setTargetExpId] = useState(defaultExperimentId);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      await api.createRun(targetExpId, checkpointId);
      addToast("Run forked successfully", "success");
      onForked();
      onClose();
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [targetExpId, checkpointId, addToast, onForked, onClose]);

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.box} onClick={(e) => e.stopPropagation()}>
        <div style={s.title}>Fork Run</div>

        <div style={s.row}>
          <span style={s.rowLabel}>Source run</span>
          <code style={s.code}>{sourceRunId}</code>
        </div>
        <div style={s.row}>
          <span style={s.rowLabel}>From checkpoint</span>
          <code style={s.code}>{checkpointId}</code>
        </div>

        <label style={s.label}>Target Experiment</label>
        <select style={s.select} value={targetExpId} onChange={(e) => setTargetExpId(e.target.value)}>
          {experiments.map((exp) => (
            <option key={exp.id} value={exp.id}>{exp.name} ({exp.id})</option>
          ))}
        </select>

        <div style={s.actions}>
          <button style={s.btnCancel} onClick={onClose}>Cancel</button>
          <button style={s.btnConfirm} onClick={handleSubmit} disabled={loading}>
            {loading ? "Forking…" : "Fork Run"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" },
  box: { background: "#2f2f2f", borderRadius: 12, padding: 24, width: 400, maxWidth: "92vw", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" },
  title: { fontSize: 15, fontWeight: 600, color: "#ececec", marginBottom: 18 },
  row: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  rowLabel: { fontSize: 12, color: "#8e8ea0", minWidth: 120 },
  code: { fontSize: 12, color: "#10a37f", fontFamily: "ui-monospace, monospace", background: "#212121", padding: "2px 8px", borderRadius: 4 },
  label: { display: "block", fontSize: 12, color: "#8e8ea0", marginBottom: 5, marginTop: 4 },
  select: { width: "100%", background: "#212121", border: "1px solid #3f3f3f", borderRadius: 7, color: "#ececec", padding: "8px 12px", fontSize: 13, marginBottom: 18, outline: "none" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 8 },
  btnCancel: { padding: "8px 16px", background: "transparent", border: "1px solid #3f3f3f", borderRadius: 7, color: "#8e8ea0", cursor: "pointer", fontSize: 13 },
  btnConfirm: { padding: "8px 16px", background: "#10a37f", border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 },
};
