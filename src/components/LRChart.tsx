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
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="epoch"
            stroke="#475569"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            label={{ value: "Epoch", position: "insideBottomRight", offset: -4, fill: "#64748b", fontSize: 11 }}
          />
          <YAxis
            stroke="#475569"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(v: number) => v.toExponential(1)}
          />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 6 }}
            labelStyle={{ color: "#94a3b8", fontSize: 12 }}
            formatter={(v) => [typeof v === "number" ? v.toExponential(4) : String(v), "LR"]}
          />
          <Line
            type="monotone"
            dataKey="lr"
            name="Learning Rate"
            stroke="#34d399"
            strokeWidth={2}
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
    height: 240,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#475569",
    fontSize: 14,
  },
};
