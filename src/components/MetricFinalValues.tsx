import React from "react";
import type { MetricsHistory } from "../api/types";

interface MetricFinalValuesProps {
  metrics: MetricsHistory;
}

/** Last finite value in a column (walks from the end; skips null/NaN). */
function lastFinite(col: number[] | undefined): number | null {
  if (!col) return null;
  for (let i = col.length - 1; i >= 0; i--) {
    const v = col[i];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const f4 = (v: number) => v.toFixed(4);
const f3 = (v: number) => v.toFixed(3);
const deg = (v: number) => `${v.toFixed(2)}°`;
const exp = (v: number) => v.toExponential(2);
const secs = (v: number) => `${v.toFixed(1)}s`;
const f1 = (v: number) => v.toFixed(1);

interface FieldSpec {
  key: string;
  label: string;
  fmt: (v: number) => string;
}

interface GroupSpec {
  name: string;
  fields: FieldSpec[];
  /** Hide the whole group when every field is absent or all-zero. */
  hideIfAllZero?: boolean;
}

const GROUPS: GroupSpec[] = [
  {
    name: "Loss",
    fields: [
      { key: "train_loss", label: "Train Loss", fmt: f4 },
      { key: "val_loss", label: "Val Loss", fmt: f4 },
    ],
  },
  {
    name: "Accuracy",
    fields: [
      { key: "train_type_acc", label: "Train Type Acc", fmt: pct },
      { key: "val_type_acc", label: "Val Type Acc", fmt: pct },
      { key: "train_exist_acc", label: "Train Exist Acc", fmt: pct },
      { key: "val_exist_acc", label: "Val Exist Acc", fmt: pct },
    ],
  },
  {
    name: "Parameter Quality",
    fields: [
      { key: "train_trans_mae", label: "Train Trans MAE", fmt: f3 },
      { key: "val_trans_mae", label: "Val Trans MAE", fmt: f3 },
      { key: "train_rot_err_deg", label: "Train Rot Err", fmt: deg },
      { key: "val_rot_err_deg", label: "Val Rot Err", fmt: deg },
      { key: "val_param_loss", label: "Val Param Loss", fmt: f4 },
    ],
  },
  {
    name: "Rounding",
    fields: [
      { key: "train_rounding_loss", label: "Train Rounding", fmt: f4 },
      { key: "val_rounding_loss", label: "Val Rounding", fmt: f4 },
    ],
  },
  {
    name: "Poincaré",
    hideIfAllZero: true,
    fields: [
      { key: "train_p_depth", label: "Train P-Depth", fmt: f4 },
      { key: "val_p_depth", label: "Val P-Depth", fmt: f4 },
      { key: "train_p_prox", label: "Train P-Prox", fmt: f4 },
      { key: "val_p_prox", label: "Val P-Prox", fmt: f4 },
      { key: "train_p_op", label: "Train P-Op", fmt: f4 },
      { key: "val_p_op", label: "Val P-Op", fmt: f4 },
      { key: "train_p_k", label: "Train P-K", fmt: f4 },
      { key: "val_p_k", label: "Val P-K", fmt: f4 },
    ],
  },
  {
    name: "Other",
    fields: [
      { key: "lr", label: "Learning Rate", fmt: exp },
      { key: "val_num_matched", label: "Num Matched", fmt: f1 },
      { key: "elapsed_sec", label: "Epoch Duration", fmt: secs },
    ],
  },
];

export function MetricFinalValues({ metrics }: MetricFinalValuesProps) {
  if (metrics.epochs.length === 0) {
    return <div style={s.muted}>No metrics recorded yet.</div>;
  }
  const finalEpoch = metrics.epochs[metrics.epochs.length - 1];

  return (
    <div style={s.root}>
      <div style={s.heading}>
        Overview — final values
        <span style={s.epoch}>epoch {finalEpoch}</span>
      </div>
      {GROUPS.map((g) => {
        const resolved = g.fields
          .map((fld) => ({ ...fld, value: lastFinite(metrics[fld.key]) }))
          .filter((fld) => fld.value !== null);
        if (resolved.length === 0) return null;
        if (g.hideIfAllZero && resolved.every((fld) => fld.value === 0)) {
          return null;
        }
        return (
          <div key={g.name} style={s.group}>
            <div style={s.groupLabel}>{g.name}</div>
            <div style={s.cards}>
              {resolved.map((fld) => (
                <div key={fld.key} style={s.card}>
                  <div style={s.cardLabel}>{fld.label}</div>
                  <div style={s.cardValue}>{fld.fmt(fld.value as number)}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 },
  heading: {
    fontSize: 11,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  epoch: {
    fontSize: 10,
    color: "#ececec",
    background: "#3f3f3f",
    borderRadius: 8,
    padding: "1px 7px",
    letterSpacing: "0.02em",
    textTransform: "none",
  },
  group: { display: "flex", flexDirection: "column", gap: 6 },
  groupLabel: {
    fontSize: 10,
    color: "#565869",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  cards: { display: "flex", flexWrap: "wrap", gap: 8 },
  card: {
    background: "#2f2f2f",
    borderRadius: 10,
    padding: "10px 14px",
    minWidth: 110,
    flex: "1 1 110px",
  },
  cardLabel: {
    fontSize: 11,
    color: "#8e8ea0",
    marginBottom: 6,
    letterSpacing: "0.02em",
  },
  cardValue: {
    fontSize: 17,
    fontWeight: 600,
    color: "#ececec",
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.01em",
  },
  muted: { color: "#565869", fontSize: 13 },
};
