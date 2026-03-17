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
      <div style={styles.sectionLabel}>Overview</div>
      <MetricCards status={status} />

      <div style={styles.row}>
        <LossChart metrics={metrics} runId={runId} />
        <LRChart metrics={metrics} runId={runId} />
      </div>

      <div style={styles.row}>
        <LossDecomposition metrics={metrics} runId={runId} />
        <RecentReconstructions scenes={recentScenes} />
      </div>

      <div style={styles.controlsCard}>
        <div style={styles.controlsTop}>
          <TrainingControls status={status} onStatusChange={refetch} />
          <div style={styles.divider} />
          <CurriculumControls status={status} onStatusChange={refetch} />
        </div>
        <HyperparamEditor status={status} />
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
  sectionLabel: {
    fontSize: 11,
    color: "#565869",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: -4,
  },
  row: {
    display: "flex",
    gap: 12,
  },
  controlsCard: {
    background: "#2f2f2f",
    borderRadius: 10,
    padding: "16px 20px",
  },
  controlsTop: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
  },
  divider: {
    width: 1,
    height: 36,
    background: "#3f3f3f",
    flexShrink: 0,
  },
};
