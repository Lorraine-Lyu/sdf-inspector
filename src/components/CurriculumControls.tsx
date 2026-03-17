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
  const tipMsg = !connected ? "Worker not running" : undefined;

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

  return (
    <div style={styles.row}>
      <div style={styles.tierInfo}>
        <span style={styles.tierLabel}>Curriculum</span>
        <span style={styles.tierValue}>
          {tier !== null ? `Tier ${tier} — ${TIER_LABELS[tier] ?? "Unknown"}` : "—"}
        </span>
      </div>
      <div style={styles.buttons}>
        <button style={styles.btn} disabled={disabled} title={disabled ? tipMsg : "Advance tier"}
          onClick={() => void call("advance")}>▲ Advance</button>
        <button style={styles.btn} disabled={disabled} title={disabled ? tipMsg : "Hold auto-advance"}
          onClick={() => void call("hold")}>■ Hold</button>
        <button style={styles.btn} disabled={disabled} title={disabled ? tipMsg : "Resume auto-advance"}
          onClick={() => void call("auto")}>Auto</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  tierInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  tierLabel: {
    fontSize: 10,
    color: "#565869",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tierValue: {
    fontSize: 13,
    fontWeight: 500,
    color: "#ececec",
  },
  buttons: {
    display: "flex",
    gap: 6,
  },
  btn: {
    padding: "6px 13px",
    background: "#3f3f3f",
    border: "none",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 500,
    color: "#ececec",
    cursor: "pointer",
  },
};
