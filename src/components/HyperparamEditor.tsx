import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { TrainingConfig, TrainingStatus } from "../api/types";
import { useToast } from "./Toast";

interface HyperparamEditorProps {
  status: TrainingStatus | null;
}

const DEFAULTS: TrainingConfig = {
  learning_rate: 0.001,
  batch_size: 16,
  loss_weights: { sdf: 0.7, eikonal: 0.2, regularization: 0.1 },
  lr_schedule: "cosine",
  max_epochs: 100,
  curriculum_auto_advance: true,
  curriculum_threshold: 0.1,
};

export function HyperparamEditor({ status }: HyperparamEditorProps) {
  const { addToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [config, setConfig] = useState<TrainingConfig>(DEFAULTS);
  const [original, setOriginal] = useState<TrainingConfig>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  const connected = status?.worker_connected ?? false;
  const runId = status?.run_id;

  useEffect(() => {
    if (!runId) return;
    fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1/runs/${runId}`)
      .then((r) => r.json())
      .then((run: { config?: TrainingConfig }) => {
        if (run.config) {
          setConfig(run.config);
          setOriginal(run.config);
        }
      })
      .catch(() => {});
  }, [runId]);

  const set = useCallback(<K extends keyof TrainingConfig>(key: K, value: TrainingConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setWeight = useCallback((key: keyof TrainingConfig["loss_weights"], value: number) => {
    setConfig((prev) => ({
      ...prev,
      loss_weights: { ...prev.loss_weights, [key]: value },
    }));
  }, []);

  const handleApply = useCallback(async () => {
    const diff: Partial<TrainingConfig> = {};
    (Object.keys(config) as (keyof TrainingConfig)[]).forEach((k) => {
      if (JSON.stringify(config[k]) !== JSON.stringify(original[k])) {
        (diff as Record<string, unknown>)[k] = config[k];
      }
    });
    if (Object.keys(diff).length === 0) {
      addToast("No changes to apply", "info");
      return;
    }
    setSaving(true);
    try {
      await api.updateConfig(diff);
      setOriginal(config);
      addToast("Config updated — takes effect next epoch", "success");
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }, [config, original, addToast]);

  return (
    <div style={styles.container}>
      <button style={styles.toggle} onClick={() => setExpanded((v) => !v)}>
        <span style={styles.arrow}>{expanded ? "▾" : "▸"}</span>
        Hyperparameters
      </button>
      {expanded && (
        <div style={styles.body}>
          <div style={styles.grid}>
            <Row label="Learning Rate">
              <input type="number" style={styles.input}
                step={0.0001} min={0.00001} max={0.1}
                value={config.learning_rate}
                onChange={(e) => set("learning_rate", parseFloat(e.target.value))} />
            </Row>
            <Row label="Batch Size">
              <input type="number" style={styles.input}
                step={1} min={1} max={256}
                value={config.batch_size}
                onChange={(e) => set("batch_size", parseInt(e.target.value, 10))} />
            </Row>
            <Row label="LR Schedule">
              <select style={styles.input} value={config.lr_schedule}
                onChange={(e) => set("lr_schedule", e.target.value)}>
                <option value="cosine">Cosine</option>
                <option value="step">Step</option>
                <option value="constant">Constant</option>
              </select>
            </Row>
            <Row label="Max Epochs">
              <input type="number" style={styles.input}
                step={1} min={1}
                value={config.max_epochs}
                onChange={(e) => set("max_epochs", parseInt(e.target.value, 10))} />
            </Row>
            <Row label="Curriculum Threshold">
              <input type="number" style={styles.input}
                step={0.01} min={0.01} max={1.0}
                value={config.curriculum_threshold}
                onChange={(e) => set("curriculum_threshold", parseFloat(e.target.value))} />
            </Row>
            <Row label="Auto-Advance">
              <input type="checkbox"
                checked={config.curriculum_auto_advance}
                onChange={(e) => set("curriculum_auto_advance", e.target.checked)}
                style={{ accentColor: "#10a37f", width: 15, height: 15 }} />
            </Row>
          </div>

          <div style={styles.weightsSection}>
            <div style={styles.weightsLabel}>Loss Weights</div>
            {(["sdf", "eikonal", "regularization"] as const).map((k) => (
              <div key={k} style={styles.weightRow}>
                <span style={styles.weightName}>{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                <input type="range" style={styles.slider}
                  min={0} max={1} step={0.01}
                  value={config.loss_weights[k]}
                  onChange={(e) => setWeight(k, parseFloat(e.target.value))} />
                <span style={styles.weightVal}>{config.loss_weights[k].toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={styles.footer}>
            <span style={styles.note}>Changes take effect at the next epoch boundary.</span>
            <button
              style={{
                ...styles.applyBtn,
                opacity: !connected ? 0.35 : 1,
                cursor: !connected ? "not-allowed" : "pointer",
              }}
              disabled={!connected || saving}
              title={!connected ? "Worker not running" : undefined}
              onClick={handleApply}
            >
              {saving ? "Saving…" : "Apply"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={rowStyles.row}>
      <span style={rowStyles.label}>{label}</span>
      <div style={rowStyles.control}>{children}</div>
    </div>
  );
}

const rowStyles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  label: {
    fontSize: 12,
    color: "#8e8ea0",
    width: 140,
    flexShrink: 0,
  },
  control: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderTop: "1px solid #3f3f3f",
    marginTop: 4,
  },
  toggle: {
    width: "100%",
    background: "none",
    border: "none",
    color: "#8e8ea0",
    cursor: "pointer",
    padding: "10px 0 10px",
    textAlign: "left",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  arrow: {
    fontSize: 12,
    color: "#565869",
  },
  body: {
    paddingBottom: 4,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px 24px",
    marginBottom: 16,
  },
  weightsSection: {
    marginBottom: 16,
  },
  weightsLabel: {
    fontSize: 11,
    color: "#565869",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: 10,
  },
  weightRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  weightName: {
    fontSize: 12,
    color: "#8e8ea0",
    width: 100,
    flexShrink: 0,
  },
  slider: {
    flex: 1,
    accentColor: "#10a37f",
    height: 4,
  },
  weightVal: {
    fontSize: 12,
    color: "#8e8ea0",
    width: 32,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
  input: {
    background: "#212121",
    border: "1px solid #3f3f3f",
    borderRadius: 6,
    color: "#ececec",
    padding: "6px 10px",
    fontSize: 12,
    width: "100%",
    outline: "none",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 4,
  },
  note: {
    fontSize: 11,
    color: "#565869",
  },
  applyBtn: {
    padding: "7px 18px",
    background: "#10a37f",
    border: "none",
    borderRadius: 7,
    color: "#fff",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },
};
