import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import type { MetricsHistory, SlotDiagnostic, TrainingStatus } from "../api/types";
import { MetricCards } from "../components/MetricCards";
import { MetricLineChart } from "../components/MetricLineChart";
import { SlotDiagnosticsSummary } from "../components/SlotDiagnosticsSummary";
import { TrainingStatusBadge } from "../components/TrainingStatusBadge";

interface DashboardProps {
  status: TrainingStatus | null;
  metrics: MetricsHistory;
  latestDiagnosticEpoch: number | null;
}

function lastRow(metrics: MetricsHistory): Record<string, number> {
  const out: Record<string, number> = {};
  if (metrics.epochs.length === 0) return out;
  const i = metrics.epochs.length - 1;
  for (const [key, col] of Object.entries(metrics)) {
    if (Array.isArray(col)) {
      const v = (col as number[])[i];
      if (typeof v === "number") out[key] = v;
    }
  }
  return out;
}

export function Dashboard({ status, metrics, latestDiagnosticEpoch }: DashboardProps) {
  const runId = status?.run_id ?? null;
  const [diagnostic, setDiagnostic] = useState<SlotDiagnostic | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);

  useEffect(() => {
    if (!runId || latestDiagnosticEpoch === null) {
      setDiagnostic(null);
      return;
    }
    setDiagnosticLoading(true);
    api
      .getSlotDiagnostic(runId, latestDiagnosticEpoch)
      .then(setDiagnostic)
      .catch(() => setDiagnostic(null))
      .finally(() => setDiagnosticLoading(false));
  }, [runId, latestDiagnosticEpoch]);

  const last = lastRow(metrics);

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div style={styles.sectionLabel}>Overview</div>
        <TrainingStatusBadge status={status} />
      </div>

      <MetricCards status={status} lastMetrics={last} />

      {runId && diagnostic && (
        <SlotDiagnosticsSummary
          runId={runId}
          diagnostic={diagnostic}
          loading={diagnosticLoading}
        />
      )}

      <div style={styles.row}>
        <MetricLineChart
          title="Loss Curves"
          metrics={metrics}
          logToggle
          series={[
            { key: "train_loss", label: "Train", color: "#ececec" },
            { key: "val_loss", label: "Val", color: "#8e8ea0", dash: "4 2" },
          ]}
          emptyMessage={runId ? "Waiting for first epoch…" : "No active run"}
        />
        <MetricLineChart
          title="Learning Rate"
          metrics={metrics}
          logToggle
          series={[{ key: "lr", label: "LR", color: "#10a37f" }]}
          emptyMessage={runId ? "Waiting for first epoch…" : "No active run"}
        />
      </div>

      <div style={styles.row}>
        <MetricLineChart
          title="Type & Existence Accuracy"
          metrics={metrics}
          series={[
            { key: "train_type_acc", label: "Train type", color: "#10a37f" },
            { key: "val_type_acc", label: "Val type", color: "#10a37f", dash: "4 2" },
            { key: "train_exist_acc", label: "Train exist", color: "#f5a623" },
            { key: "val_exist_acc", label: "Val exist", color: "#f5a623", dash: "4 2" },
          ]}
        />
        <MetricLineChart
          title="Parameter Quality"
          metrics={metrics}
          series={[
            { key: "train_trans_mae", label: "Train trans MAE", color: "#10a37f" },
            { key: "val_trans_mae", label: "Val trans MAE", color: "#10a37f", dash: "4 2" },
            { key: "train_rot_err_deg", label: "Train rot err°", color: "#ef4444" },
            { key: "val_rot_err_deg", label: "Val rot err°", color: "#ef4444", dash: "4 2" },
          ]}
        />
      </div>

      <div style={styles.row}>
        <MetricLineChart
          title="Rounding Loss"
          metrics={metrics}
          series={[
            { key: "train_rounding_loss", label: "Train", color: "#ececec" },
            { key: "val_rounding_loss", label: "Val", color: "#8e8ea0", dash: "4 2" },
          ]}
        />
        <MetricLineChart
          title="Poincaré Losses"
          metrics={metrics}
          hideIfAllZero
          series={[
            { key: "train_p_depth", label: "Train depth", color: "#10a37f" },
            { key: "val_p_depth", label: "Val depth", color: "#10a37f", dash: "4 2" },
            { key: "train_p_prox", label: "Train prox", color: "#f5a623" },
            { key: "val_p_prox", label: "Val prox", color: "#f5a623", dash: "4 2" },
            { key: "train_p_op", label: "Train op", color: "#3b82f6" },
            { key: "val_p_op", label: "Val op", color: "#3b82f6", dash: "4 2" },
            { key: "train_p_k", label: "Train k", color: "#ef4444" },
            { key: "val_p_k", label: "Val k", color: "#ef4444", dash: "4 2" },
          ]}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  sectionLabel: {
    fontSize: 11,
    color: "#565869",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  row: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
};
