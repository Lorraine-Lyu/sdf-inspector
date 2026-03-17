import React, { useCallback } from "react";
import { api } from "../api/client";
import type { TrainingStatus } from "../api/types";
import { useToast } from "./Toast";

const TIER_LABELS: Record<number, string> = {
  0: "Simple",
  1: "Transformed",
  2: "Combined",
};

interface CurriculumControlsProps {
  status: TrainingStatus | null;
  onStatusChange: () => void;
}

export function CurriculumControls({ status, onStatusChange }: CurriculumControlsProps) {
  const { addToast } = useToast();

  const tier = status?.curriculum_tier ?? null;
  const connected = status?.worker_connected ?? false;
  const state = status?.state ?? "idle";
  const disabled = !connected || state === "idle" || state === "stopped";

  const call = useCallback(
    async (action: "advance" | "hold" | "auto") => {
      try {
        await api.advanceCurriculum(action);
        onStatusChange();
      } catch (e) {
        addToast((e as Error).message, "error");
      }
    },
    [addToast, onStatusChange]
  );

  const tipMsg = !connected ? "Worker not running" : undefined;

  return (
    <div style={styles.row}>
      <div style={styles.tierBadge}>
        <span style={styles.tierLabel}>Curriculum</span>
        <span style={styles.tierValue}>
          {tier !== null
            ? `Tier ${tier} — ${TIER_LABELS[tier] ?? "Unknown"}`
            : "—"}
        </span>
      </div>
      <div style={styles.buttons}>
        <button
          style={{ ...styles.btn, ...styles.btnAdvance }}
          disabled={disabled}
          title={disabled ? tipMsg : "Manually advance to next tier"}
          onClick={() => void call("advance")}
        >
          ▲ Advance
        </button>
        <button
          style={{ ...styles.btn, ...styles.btnHold }}
          disabled={disabled}
          title={disabled ? tipMsg : "Disable auto-advance"}
          onClick={() => void call("hold")}
        >
          ■ Hold
        </button>
        <button
          style={{ ...styles.btn, ...styles.btnAuto }}
          disabled={disabled}
          title={disabled ? tipMsg : "Re-enable auto-advance"}
          onClick={() => void call("auto")}
        >
          A Auto
        </button>
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
  tierBadge: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  tierLabel: {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tierValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#60a5fa",
  },
  buttons: {
    display: "flex",
    gap: 6,
  },
  btn: {
    padding: "6px 12px",
    border: "none",
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnAdvance: {
    background: "#1d4ed8",
    color: "#fff",
  },
  btnHold: {
    background: "#374151",
    color: "#e2e8f0",
  },
  btnAuto: {
    background: "#065f46",
    color: "#34d399",
  },
};
