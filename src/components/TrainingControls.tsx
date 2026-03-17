import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { Experiment, TrainingStatus } from "../api/types";
import { useToast } from "./Toast";

interface TrainingControlsProps {
  status: TrainingStatus | null;
  onStatusChange: () => void;
}

export function TrainingControls({ status, onStatusChange }: TrainingControlsProps) {
  const { addToast } = useToast();
  const [showStartDialog, setShowStartDialog] = useState(false);

  const state = status?.state ?? "idle";
  const connected = status?.worker_connected ?? false;

  const handlePause = useCallback(async () => {
    try {
      await api.pauseTraining();
      onStatusChange();
    } catch (e) {
      addToast((e as Error).message, "error");
    }
  }, [addToast, onStatusChange]);

  const handleStop = useCallback(async () => {
    try {
      await api.stopTraining();
      onStatusChange();
    } catch (e) {
      addToast((e as Error).message, "error");
    }
  }, [addToast, onStatusChange]);

  const canStart = state === "idle" || state === "stopped";
  const canPause = state === "training" && connected;
  const canStop = (state === "training" || state === "paused") && connected;
  const disabledTip = !connected ? "Worker not running" : undefined;

  return (
    <div style={styles.row}>
      <div style={styles.controls}>
        <button
          style={{ ...styles.btn, ...styles.btnStart }}
          disabled={!canStart}
          onClick={() => setShowStartDialog(true)}
        >
          Start
        </button>
        <button
          style={{ ...styles.btn, ...styles.btnPause }}
          disabled={!canPause}
          title={!canPause && !canStart ? disabledTip : undefined}
          onClick={handlePause}
        >
          Pause
        </button>
        <button
          style={{ ...styles.btn, ...styles.btnStop }}
          disabled={!canStop}
          title={!canStop && state !== "idle" ? disabledTip : undefined}
          onClick={handleStop}
        >
          Stop
        </button>
      </div>
      <div
        style={{
          ...styles.workerBadge,
          background: connected ? "#10b98122" : "#37415122",
          color: connected ? "#34d399" : "#6b7280",
          border: `1px solid ${connected ? "#10b98144" : "#37415166"}`,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: connected ? "#10b981" : "#6b7280",
            display: "inline-block",
            marginRight: 6,
          }}
        />
        {connected ? "Worker connected" : "Worker not connected"}
      </div>

      {showStartDialog && (
        <StartDialog
          onClose={() => setShowStartDialog(false)}
          onStarted={onStatusChange}
        />
      )}
    </div>
  );
}

function StartDialog({
  onClose,
  onStarted,
}: {
  onClose: () => void;
  onStarted: () => void;
}) {
  const { addToast } = useToast();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [experimentId, setExperimentId] = useState("");
  const [runId, setRunId] = useState("");
  const [loading, setLoading] = useState(false);
  const [cliCommand, setCliCommand] = useState<string | null>(null);

  useEffect(() => {
    api.listExperiments().then((exps) => {
      setExperiments(exps);
      if (exps.length > 0) setExperimentId(exps[0].id);
    }).catch(() => {});
  }, []);

  const handleStart = useCallback(async () => {
    if (!experimentId) return;
    setLoading(true);
    try {
      const result = await api.startTraining(experimentId, runId || undefined);
      const rid = (result as { run_id?: string }).run_id ?? runId ?? "run_001";
      setCliCommand(`python -m worker --experiment ${experimentId} --run ${rid} --data-dir data/`);
      addToast("Run config created — start the worker to begin training", "success");
      onStarted();
    } catch (e) {
      addToast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [experimentId, runId, addToast, onStarted]);

  return (
    <div style={dialogStyles.overlay} onClick={onClose}>
      <div style={dialogStyles.box} onClick={(e) => e.stopPropagation()}>
        <div style={dialogStyles.title}>Start Training Run</div>

        <label style={dialogStyles.label}>Experiment</label>
        <select
          style={dialogStyles.input}
          value={experimentId}
          onChange={(e) => setExperimentId(e.target.value)}
        >
          {experiments.map((exp) => (
            <option key={exp.id} value={exp.id}>
              {exp.name} ({exp.id})
            </option>
          ))}
          {experiments.length === 0 && (
            <option value="">No experiments found</option>
          )}
        </select>

        <label style={dialogStyles.label}>Run ID (optional)</label>
        <input
          style={dialogStyles.input}
          type="text"
          placeholder="e.g. run_001"
          value={runId}
          onChange={(e) => setRunId(e.target.value)}
        />

        {cliCommand && (
          <div style={dialogStyles.cliBox}>
            <div style={dialogStyles.cliLabel}>
              Run config created. Start the worker with:
            </div>
            <code style={dialogStyles.cli}>{cliCommand}</code>
          </div>
        )}

        <div style={dialogStyles.actions}>
          <button style={dialogStyles.btnCancel} onClick={onClose}>
            {cliCommand ? "Close" : "Cancel"}
          </button>
          {!cliCommand && (
            <button
              style={dialogStyles.btnConfirm}
              onClick={handleStart}
              disabled={!experimentId || loading}
            >
              {loading ? "Creating…" : "Create Run"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  controls: {
    display: "flex",
    gap: 8,
  },
  btn: {
    padding: "8px 18px",
    borderRadius: 6,
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  btnStart: {
    background: "#10b981",
    color: "#fff",
  },
  btnPause: {
    background: "#f59e0b",
    color: "#111",
  },
  btnStop: {
    background: "#ef4444",
    color: "#fff",
  },
  workerBadge: {
    fontSize: 12,
    padding: "5px 12px",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
  },
};

const dialogStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  box: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: 24,
    width: 400,
    maxWidth: "90vw",
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "#f9fafb",
    marginBottom: 18,
  },
  label: {
    display: "block",
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 5,
    color: "#e2e8f0",
    padding: "8px 10px",
    fontSize: 13,
    marginBottom: 14,
    boxSizing: "border-box",
  },
  cliBox: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 6,
    padding: "10px 14px",
    marginBottom: 16,
  },
  cliLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 6,
  },
  cli: {
    fontSize: 12,
    color: "#34d399",
    wordBreak: "break-all",
    fontFamily: "monospace",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  btnCancel: {
    padding: "8px 16px",
    background: "transparent",
    border: "1px solid #475569",
    borderRadius: 6,
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 13,
  },
  btnConfirm: {
    padding: "8px 16px",
    background: "#10b981",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
};
