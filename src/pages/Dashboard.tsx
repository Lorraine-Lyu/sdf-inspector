import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import type { MetricsHistory, SlotDiagnostic, TrainingStatus } from "../api/types";
import { MetricCards } from "../components/MetricCards";
import { MetricChartGrid } from "../components/MetricChartGrid";
import { ReconstructionSnapshots } from "../components/dashboard/ReconstructionSnapshots";
import { SlotDiagnosticsSummary } from "../components/SlotDiagnosticsSummary";
import { TrainingStatusBadge } from "../components/TrainingStatusBadge";

interface DashboardProps {
  status: TrainingStatus | null;
  metrics: MetricsHistory;
  latestDiagnosticEpoch: number | null;
  latestSnapshotEpoch: number | null;
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

export function Dashboard({
  status,
  metrics,
  latestDiagnosticEpoch,
  latestSnapshotEpoch,
}: DashboardProps) {
  const runId = status?.run_id ?? null;
  const experimentId = status?.experiment_id ?? null;
  const [diagnostic, setDiagnostic] = useState<SlotDiagnostic | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);

  useEffect(() => {
    if (!runId || !experimentId || latestDiagnosticEpoch === null) {
      setDiagnostic(null);
      return;
    }
    setDiagnosticLoading(true);
    api
      .getSlotDiagnostic(runId, latestDiagnosticEpoch, experimentId)
      .then(setDiagnostic)
      .catch(() => setDiagnostic(null))
      .finally(() => setDiagnosticLoading(false));
  }, [runId, experimentId, latestDiagnosticEpoch]);

  const last = lastRow(metrics);

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div style={styles.sectionLabel}>Overview</div>
        <TrainingStatusBadge status={status} />
      </div>

      <div className="dashboard-layout">
        <div className="dashboard-overview">
          <MetricCards status={status} lastMetrics={last} />
          {runId && diagnostic && (
            <SlotDiagnosticsSummary
              runId={runId}
              experimentId={status?.experiment_id ?? null}
              diagnostic={diagnostic}
              loading={diagnosticLoading}
            />
          )}
        </div>

        <div className="dashboard-charts">
          <MetricChartGrid metrics={metrics} isLive={true} />
        </div>
      </div>

      <ReconstructionSnapshots
        runId={runId}
        experimentId={experimentId}
        latestEpoch={latestSnapshotEpoch}
      />
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
};
