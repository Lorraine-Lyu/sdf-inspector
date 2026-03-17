import React from "react";
import type { TrainingStatus } from "../api/types";

const TIER_LABELS: Record<number, string> = {
  0: "Tier 0 — Simple",
  1: "Tier 1 — Transformed",
  2: "Tier 2 — Combined",
};

function formatEta(seconds: number | null): string {
  if (seconds === null) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatRelativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function stateColor(state: TrainingStatus["state"]): string {
  switch (state) {
    case "training": return "#10a37f";
    case "paused":   return "#f5a623";
    case "error":    return "#ef4444";
    default:         return "#565869";
  }
}

interface CardProps {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
}

function Card({ label, value, valueColor }: CardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.cardLabel}>{label}</div>
      <div style={{ ...styles.cardValue, color: valueColor ?? "#ececec" }}>{value}</div>
    </div>
  );
}

interface MetricCardsProps {
  status: TrainingStatus | null;
}

export function MetricCards({ status }: MetricCardsProps) {
  if (!status) {
    return <div style={styles.row}><div style={styles.placeholder}>Loading…</div></div>;
  }

  const workerWarning =
    !status.worker_connected &&
    status.state !== "idle" &&
    status.state !== "stopped";

  return (
    <div>
      {workerWarning && (
        <div style={styles.workerWarning}>
          Worker disconnected — live updates unavailable
        </div>
      )}
      <div style={styles.row}>
        <Card
          label="Epoch"
          value={status.epoch !== null ? status.epoch : "—"}
          valueColor={status.epoch !== null ? undefined : "#565869"}
        />
        <Card
          label="Train Loss"
          value={status.loss !== null ? status.loss.toFixed(4) : "—"}
          valueColor={status.loss !== null ? undefined : "#565869"}
        />
        <Card
          label="Val Loss"
          value={status.val_loss !== null ? status.val_loss.toFixed(4) : "—"}
          valueColor={status.val_loss !== null ? undefined : "#565869"}
        />
        <Card
          label="Learning Rate"
          value={status.lr !== null ? status.lr.toExponential(2) : "—"}
          valueColor={status.lr !== null ? undefined : "#565869"}
        />
        <Card
          label="ETA"
          value={formatEta(status.eta_seconds)}
          valueColor={status.eta_seconds !== null ? undefined : "#565869"}
        />
        <Card
          label="Tier"
          value={
            status.curriculum_tier !== null
              ? TIER_LABELS[status.curriculum_tier] ?? `Tier ${status.curriculum_tier}`
              : "—"
          }
          valueColor={status.curriculum_tier !== null ? "#ececec" : "#565869"}
        />
        <Card
          label="State"
          value={
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: stateColor(status.state),
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: stateColor(status.state),
                  boxShadow: status.state === "training" ? "0 0 6px #10a37f88" : "none",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {status.state}
            </span>
          }
        />
        {status.last_backup && (
          <Card
            label="Backup"
            value={`Epoch ${status.last_backup.epoch} · ${formatRelativeTime(status.last_backup.timestamp)}`}
            valueColor={status.last_backup.success ? "#10a37f" : "#ef4444"}
          />
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  card: {
    background: "#2f2f2f",
    borderRadius: 10,
    padding: "12px 16px",
    minWidth: 100,
    flex: "1 1 100px",
  },
  cardLabel: {
    fontSize: 11,
    color: "#8e8ea0",
    marginBottom: 6,
    letterSpacing: "0.02em",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.01em",
  },
  placeholder: {
    color: "#565869",
    fontSize: 14,
  },
  workerWarning: {
    background: "#2f2f2f",
    borderLeft: "3px solid #f5a623",
    borderRadius: 6,
    color: "#f5a623",
    padding: "8px 14px",
    fontSize: 13,
    marginBottom: 12,
  },
};
