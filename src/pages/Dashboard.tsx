import React from "react";
import type { MetricsHistory, SceneResultEvent, TrainingStatus } from "../api/types";
import { CurriculumControls } from "../components/CurriculumControls";
import { HyperparamEditor } from "../components/HyperparamEditor";
import { LossChart } from "../components/LossChart";
import { LossDecomposition } from "../components/LossDecomposition";
import { LRChart } from "../components/LRChart";
import { MetricCards } from "../components/MetricCards";
import { RecentReconstructions } from "../components/RecentReconstructions";
import { TrainingControls } from "../components/TrainingControls";

interface DashboardProps {
  status: TrainingStatus | null;
  metrics: MetricsHistory;
  recentScenes: SceneResultEvent[];
  refetch: () => void;
}

export function Dashboard({ status, metrics, recentScenes, refetch }: DashboardProps) {
  const runId = status?.run_id ?? null;

  return (
    <div style={styles.page}>
      <section>
        <MetricCards status={status} />
      </section>

      <section style={styles.row}>
        <LossChart metrics={metrics} runId={runId} />
        <LRChart metrics={metrics} runId={runId} />
      </section>

      <section style={styles.row}>
        <LossDecomposition metrics={metrics} runId={runId} />
        <RecentReconstructions scenes={recentScenes} />
      </section>

      <section style={styles.controlsSection}>
        <div style={styles.controlsRow}>
          <TrainingControls status={status} onStatusChange={refetch} />
          <div style={styles.divider} />
          <CurriculumControls status={status} onStatusChange={refetch} />
        </div>
        <HyperparamEditor status={status} />
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  row: {
    display: "flex",
    gap: 16,
  },
  controlsSection: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: 16,
  },
  controlsRow: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
  },
  divider: {
    width: 1,
    height: 40,
    background: "#334155",
    flexShrink: 0,
  },
};
