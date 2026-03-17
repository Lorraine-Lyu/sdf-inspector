import React, { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricsHistory } from "../api/types";

interface LRChartProps {
  metrics: MetricsHistory;
  runId: string | null;
}

export function LRChart({ metrics, runId }: LRChartProps) {
  const data = useMemo(
    () =>
      metrics.epochs.map((epoch, i) => ({
        epoch,
        lr: metrics.lr[i] ?? null,
      })),
    [metrics]
  );

  if (!runId) {
    return (
      <div style={styles.container}>
        <div style={styles.header}><span style={styles.title}>LR Schedule</span></div>
        <div style={styles.empty}>No active run</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}><span style={styles.title}>LR Schedule</span></div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" vertical={false} />
          <XAxis
            dataKey="epoch"
            stroke="transparent"
            tick={{ fill: "#565869", fontSize: 11 }}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: "#565869", fontSize: 11 }}
            tickFormatter={(v) => (typeof v === "number" ? v.toExponential(0) : String(v))}
          />
          <Tooltip
            contentStyle={{ background: "#2f2f2f", border: "none", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
            labelStyle={{ color: "#8e8ea0", fontSize: 12, marginBottom: 4 }}
            formatter={(v) => [typeof v === "number" ? v.toExponential(4) : String(v), "LR"]}
            cursor={{ stroke: "#3f3f3f", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="lr"
            name="LR"
            stroke="#10a37f"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
        </LineChart>
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
    height: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#565869",
    fontSize: 13,
  },
};
