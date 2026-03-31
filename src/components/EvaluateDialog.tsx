import React, { useCallback, useState } from "react";
import { api } from "../api/client";
import { useToast } from "./Toast";

interface EvaluateDialogProps {
  checkpointId: string;
  onClose: () => void;
}

export function EvaluateDialog({ checkpointId, onClose }: EvaluateDialogProps) {
  const { addToast } = useToast();
  const [sceneIds, setSceneIds] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    const ids = sceneIds.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!ids.length) return;
    setLoading(true);
    try {
      const res = await api.evaluate(ids, checkpointId);
      addToast(`Evaluation queued for ${res.scene_count} scene(s)`, "success");
      onClose();
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [sceneIds, checkpointId, addToast, onClose]);

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.box} onClick={(e) => e.stopPropagation()}>
        <div style={s.title}>Evaluate Checkpoint</div>

        <div style={s.field}>
          <span style={s.fieldLabel}>Checkpoint</span>
          <code style={s.code}>{checkpointId}</code>
        </div>

        <label style={s.label}>Scene IDs <span style={s.hint}>(one per line)</span></label>
        <textarea
          style={s.textarea}
          value={sceneIds}
          onChange={(e) => setSceneIds(e.target.value)}
          placeholder={"scene_001\nscene_042\n..."}
          autoFocus
        />

        <div style={s.actions}>
          <button style={s.btnCancel} onClick={onClose}>Cancel</button>
          <button
            style={s.btnConfirm}
            onClick={handleSubmit}
            disabled={!sceneIds.trim() || loading}
          >
            {loading ? "Queuing…" : "Evaluate"}
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
  field: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  fieldLabel: { fontSize: 12, color: "#8e8ea0" },
  code: { fontSize: 12, color: "#10a37f", fontFamily: "ui-monospace, monospace", background: "#212121", padding: "2px 8px", borderRadius: 4 },
  label: { display: "block", fontSize: 12, color: "#8e8ea0", marginBottom: 5 },
  hint: { color: "#565869" },
  textarea: { width: "100%", height: 120, background: "#212121", border: "1px solid #3f3f3f", borderRadius: 7, color: "#ececec", padding: "8px 12px", fontSize: 13, marginBottom: 16, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "ui-monospace, monospace" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 8 },
  btnCancel: { padding: "8px 16px", background: "transparent", border: "1px solid #3f3f3f", borderRadius: 7, color: "#8e8ea0", cursor: "pointer", fontSize: 13 },
  btnConfirm: { padding: "8px 16px", background: "#10a37f", border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 },
};
