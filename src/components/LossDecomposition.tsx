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
        <div style={styles.header}><span style={styles.title}>Loss Breakdown</span></div>
        <div style={styles.empty}>No active run</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}><span style={styles.title}>Loss Breakdown</span></div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f3f" vertical={false} />
          <XAxis
            dataKey="epoch"
            stroke="transparent"
            tick={{ fill: "#565869", fontSize: 11 }}
          />
          <YAxis stroke="transparent" tick={{ fill: "#565869", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "#2f2f2f", border: "none", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
            labelStyle={{ color: "#8e8ea0", fontSize: 12, marginBottom: 4 }}
            itemStyle={{ fontSize: 12, color: "#ececec" }}
            cursor={{ stroke: "#3f3f3f", strokeWidth: 1 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#8e8ea0", paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          <Area type="monotone" dataKey="sdf" name="SDF" stackId="1"
            stroke="#ececec" fill="#ececec18" strokeWidth={1} />
          <Area type="monotone" dataKey="eikonal" name="Eikonal" stackId="1"
            stroke="#8e8ea0" fill="#8e8ea018" strokeWidth={1} />
          <Area type="monotone" dataKey="regularization" name="Reg." stackId="1"
            stroke="#565869" fill="#56586918" strokeWidth={1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "#2f2f2f",
    borderRadius: 10,
    padding: "16px 16px 12px",
    flex: 1,
    minWidth: 0,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: 500,
    color: "#ececec",
  },
  empty: {
    height: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#565869",
    fontSize: 13,
  },
};
