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
          style={{ ...styles.btn, ...styles.btnPrimary }}
          disabled={!canStart}
          onClick={() => setShowStartDialog(true)}
        >
          Start
        </button>
        <button
          style={styles.btn}
          disabled={!canPause}
          title={!canPause && !canStart ? disabledTip : undefined}
          onClick={handlePause}
        >
          Pause
        </button>
        <button
          style={styles.btn}
          disabled={!canStop}
          title={!canStop && state !== "idle" ? disabledTip : undefined}
          onClick={handleStop}
        >
          Stop
        </button>
      </div>

      <div style={styles.workerBadge}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: connected ? "#10a37f" : "#565869",
            boxShadow: connected ? "0 0 5px #10a37f88" : "none",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span style={{ color: connected ? "#8e8ea0" : "#565869" }}>
          {connected ? "Worker connected" : "Not connected"}
        </span>
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
      addToast("Run created — start the worker to begin training", "success");
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
          {experiments.length === 0 && <option value="">No experiments found</option>}
        </select>

        <label style={dialogStyles.label}>Run ID <span style={{ color: "#565869" }}>(optional)</span></label>
        <input
          style={dialogStyles.input}
          type="text"
          placeholder="e.g. run_001"
          value={runId}
          onChange={(e) => setRunId(e.target.value)}
        />

        {cliCommand && (
          <div style={dialogStyles.cliBox}>
            <div style={dialogStyles.cliLabel}>Start the worker with:</div>
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
    gap: 14,
    flexWrap: "wrap",
  },
  controls: {
    display: "flex",
    gap: 6,
  },
  btn: {
    padding: "7px 16px",
    borderRadius: 8,
    border: "none",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    background: "#3f3f3f",
    color: "#ececec",
  },
  btnPrimary: {
    background: "#10a37f",
    color: "#fff",
  },
  workerBadge: {
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
};

const dialogStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(2px)",
  },
  box: {
    background: "#2f2f2f",
    borderRadius: 12,
    padding: 24,
    width: 400,
    maxWidth: "90vw",
    boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: "#ececec",
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontSize: 12,
    color: "#8e8ea0",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    background: "#212121",
    border: "1px solid #3f3f3f",
    borderRadius: 7,
    color: "#ececec",
    padding: "8px 12px",
    fontSize: 13,
    marginBottom: 14,
    outline: "none",
  },
  cliBox: {
    background: "#212121",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 18,
  },
  cliLabel: {
    fontSize: 11,
    color: "#8e8ea0",
    marginBottom: 6,
  },
  cli: {
    fontSize: 12,
    color: "#10a37f",
    wordBreak: "break-all",
    fontFamily: "ui-monospace, monospace",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },
  btnCancel: {
    padding: "8px 16px",
    background: "transparent",
    border: "1px solid #3f3f3f",
    borderRadius: 7,
    color: "#8e8ea0",
    cursor: "pointer",
    fontSize: 13,
  },
  btnConfirm: {
    padding: "8px 16px",
    background: "#10a37f",
    border: "none",
    borderRadius: 7,
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },
};
