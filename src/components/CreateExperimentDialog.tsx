import React, { useCallback, useState } from "react";
import { api } from "../api/client";
import { useToast } from "./Toast";

interface CreateExperimentDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateExperimentDialog({ onClose, onCreated }: CreateExperimentDialogProps) {
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);

  const [lr, setLr] = useState("0.001");
  const [batchSize, setBatchSize] = useState("16");
  const [lrSchedule, setLrSchedule] = useState("cosine");
  const [maxEpochs, setMaxEpochs] = useState("1000");
  const [modelArch, setModelArch] = useState("pointnet_encoder_v1");
  const [sdfW, setSdfW] = useState("0.7");
  const [eikonalW, setEikonalW] = useState("0.2");
  const [regW, setRegW] = useState("0.1");
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [threshold, setThreshold] = useState("0.1");

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.createExperiment({
        name: name.trim(),
        description: description.trim(),
        config: {
          model_architecture: modelArch,
          learning_rate: parseFloat(lr),
          batch_size: parseInt(batchSize),
          lr_schedule: lrSchedule,
          max_epochs: parseInt(maxEpochs),
          loss_weights: {
            sdf: parseFloat(sdfW),
            eikonal: parseFloat(eikonalW),
            regularization: parseFloat(regW),
          },
          curriculum_auto_advance: autoAdvance,
          curriculum_threshold: parseFloat(threshold),
        },
      });
      addToast(`Experiment "${name}" created`, "success");
      onCreated();
      onClose();
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [name, description, modelArch, lr, batchSize, lrSchedule, maxEpochs, sdfW, eikonalW, regW, autoAdvance, threshold, addToast, onCreated, onClose]);

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.box} onClick={(e) => e.stopPropagation()}>
        <div style={s.title}>New Experiment</div>

        <label style={s.label}>Name</label>
        <input style={s.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Baseline v2" autoFocus />

        <label style={s.label}>Description <span style={s.opt}>(optional)</span></label>
        <textarea style={{ ...s.input, height: 60, resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} />

        <button style={s.configToggle} onClick={() => setShowConfig((v) => !v)}>
          {showConfig ? "▾" : "▸"} Config
        </button>

        {showConfig && (
          <div style={s.configGrid}>
            {[
              ["Model Architecture", modelArch, setModelArch, "text"],
              ["Learning Rate", lr, setLr, "text"],
              ["Batch Size", batchSize, setBatchSize, "text"],
              ["Max Epochs", maxEpochs, setMaxEpochs, "text"],
              ["Curriculum Threshold", threshold, setThreshold, "text"],
              ["Loss: SDF", sdfW, setSdfW, "text"],
              ["Loss: Eikonal", eikonalW, setEikonalW, "text"],
              ["Loss: Regularization", regW, setRegW, "text"],
            ].map(([label, value, setter]) => (
              <React.Fragment key={label as string}>
                <span style={s.cfgLabel}>{label as string}</span>
                <input style={s.cfgInput} value={value as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)} />
              </React.Fragment>
            ))}
            <span style={s.cfgLabel}>LR Schedule</span>
            <select style={s.cfgInput} value={lrSchedule} onChange={(e) => setLrSchedule(e.target.value)}>
              {["cosine", "step", "constant"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <span style={s.cfgLabel}>Auto-advance Curriculum</span>
            <input type="checkbox" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} />
          </div>
        )}

        <div style={s.actions}>
          <button style={s.btnCancel} onClick={onClose}>Cancel</button>
          <button style={s.btnConfirm} onClick={handleSubmit} disabled={!name.trim() || loading}>
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" },
  box: { background: "#2f2f2f", borderRadius: 12, padding: 24, width: 440, maxWidth: "92vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" },
  title: { fontSize: 15, fontWeight: 600, color: "#ececec", marginBottom: 18 },
  label: { display: "block", fontSize: 12, color: "#8e8ea0", marginBottom: 5 },
  opt: { color: "#565869" },
  input: { width: "100%", background: "#212121", border: "1px solid #3f3f3f", borderRadius: 7, color: "#ececec", padding: "8px 12px", fontSize: 13, marginBottom: 14, outline: "none", boxSizing: "border-box" },
  configToggle: { background: "transparent", border: "none", color: "#8e8ea0", fontSize: 13, cursor: "pointer", padding: "0 0 12px 0", textAlign: "left" },
  configGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginBottom: 16 },
  cfgLabel: { fontSize: 12, color: "#8e8ea0", alignSelf: "center" },
  cfgInput: { background: "#212121", border: "1px solid #3f3f3f", borderRadius: 6, color: "#ececec", padding: "5px 8px", fontSize: 12, outline: "none" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 },
  btnCancel: { padding: "8px 16px", background: "transparent", border: "1px solid #3f3f3f", borderRadius: 7, color: "#8e8ea0", cursor: "pointer", fontSize: 13 },
  btnConfirm: { padding: "8px 16px", background: "#10a37f", border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 },
};
