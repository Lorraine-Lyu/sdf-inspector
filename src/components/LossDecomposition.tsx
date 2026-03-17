import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricsHistory } from "../api/types";

interface LossDecompositionProps {
  metrics: MetricsHistory;
  runId: string | null;
}

export function LossDecomposition({ metrics, runId }: LossDecompositionProps) {
  const data = useMemo(
    () =>
      metrics.epochs.map((epoch, i) => ({
        epoch,
        sdf: metrics.component_losses.sdf[i] ?? null,
        eikonal: metrics.component_losses.eikonal[i] ?? null,
        regularization: metrics.component_losses.regularization[i] ?? null,
      })),
    [metrics]
  );

  if (!runId) {
    return (
      <div style={styles.container}>
        <div style={styles.header}><span style={styles.title}>Loss Decomposition</span></div>
        <div style={styles.empty}>No active run</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}><span style={styles.title}>Loss Decomposition</span></div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
          <XAxis
            dataKey="epoch"
            stroke="#475569"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />
          <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 6 }}
            labelStyle={{ color: "#94a3b8", fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
          <Area
            type="monotone"
            dataKey="sdf"
            name="SDF"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f633"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="eikonal"
            name="Eikonal"
            stackId="1"
            stroke="#a78bfa"
            fill="#a78bfa33"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="regularization"
            name="Regularization"
            stackId="1"
            stroke="#34d399"
            fill="#34d39933"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: "14px 16px",
    flex: 1,
    minWidth: 0,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: "#e2e8f0",
  },
  empty: {
    height: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#475569",
    fontSize: 14,
  },
};
