import React from "react";
import type { TrainingStatus } from "../api/types";

function formatEta(seconds: number | null): string {
  if (seconds === null || !isFinite(seconds)) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatElapsed(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
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
  /** Most recent epoch's row from metrics.jsonl (used for accuracy / quality cards). */
  lastMetrics?: Record<string, number | null | undefined>;
}

export function MetricCards({ status, lastMetrics }: MetricCardsProps) {
  if (!status) {
    return <div style={styles.row}><div style={styles.placeholder}>Loading…</div></div>;
  }

  const m = lastMetrics ?? {};
  const num = (v: unknown): number | null =>
    typeof v === "number" && isFinite(v) ? v : null;

  const typeAcc = num(m.val_type_acc) ?? num(m.train_type_acc);
  const existAcc = num(m.val_exist_acc) ?? num(m.train_exist_acc);
  const transMae = num(m.val_trans_mae) ?? num(m.train_trans_mae);
  const rotErr = num(m.val_rot_err_deg) ?? num(m.train_rot_err_deg);

  return (
    <div style={styles.stack}>
      <div style={styles.row}>
        <Card label="Epoch" value={status.epoch ?? "—"} />
        <Card
          label="Train Loss"
          value={status.train_loss !== null ? status.train_loss.toFixed(4) : "—"}
        />
        <Card
          label="Val Loss"
          value={status.val_loss !== null ? status.val_loss.toFixed(4) : "—"}
        />
        <Card
          label="Learning Rate"
          value={status.lr !== null ? status.lr.toExponential(2) : "—"}
        />
      </div>
      <div style={styles.row}>
        <Card
          label="Type Acc"
          value={typeAcc !== null ? `${(typeAcc * 100).toFixed(0)}%` : "—"}
        />
        <Card
          label="Exist Acc"
          value={existAcc !== null ? `${(existAcc * 100).toFixed(0)}%` : "—"}
        />
        <Card
          label="Trans MAE"
          value={transMae !== null ? transMae.toFixed(3) : "—"}
        />
        <Card
          label="Rot Err"
          value={rotErr !== null ? `${rotErr.toFixed(1)}°` : "—"}
        />
      </div>
      <div style={styles.row}>
        <Card label="Tier" value={status.max_tier ?? "—"} />
        <Card label="Elapsed" value={formatElapsed(status.wall_time_seconds)} />
        <Card label="ETA" value={formatEta(status.eta_seconds)} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
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
};
