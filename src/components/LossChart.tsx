import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricsHistory } from "../api/types";

interface LossChartProps {
  metrics: MetricsHistory;
  runId: string | null;
}

export function LossChart({ metrics, runId }: LossChartProps) {
  const [logScale, setLogScale] = useState(false);

  const data = useMemo(
    () =>
      metrics.epochs.map((epoch, i) => ({
        epoch,
        train: metrics.train_loss[i] ?? null,
        val: metrics.val_loss[i] ?? null,
        tier: metrics.curriculum_tier[i] ?? null,
      })),
    [metrics]
  );

  // Find tier transition epochs for reference lines
  const tierTransitions = useMemo(() => {
    const transitions: number[] = [];
    for (let i = 1; i < metrics.curriculum_tier.length; i++) {
      if (metrics.curriculum_tier[i] !== metrics.curriculum_tier[i - 1]) {
        transitions.push(metrics.epochs[i]);
      }
    }
    return transitions;
  }, [metrics]);

  if (!runId) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.title}>Loss Curves</span>
        </div>
        <div style={styles.empty}>No active run</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Loss Curves</span>
        <button
          style={{ ...styles.toggleBtn, ...(logScale ? styles.toggleActive : {}) }}
          onClick={() => setLogScale((v) => !v)}
        >
          Log scale
        </button>
      </div>
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
            scale={logScale ? "log" : "linear"}
            domain={logScale ? ["auto", "auto"] : [0, "auto"]}
            allowDataOverflow
          />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 6 }}
            labelStyle={{ color: "#94a3b8", fontSize: 12 }}
            itemStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
          {tierTransitions.map((ep) => (
            <ReferenceLine
              key={ep}
              x={ep}
              stroke="#f59e0b"
              strokeDasharray="4 2"
              label={{ value: "Tier↑", position: "top", fill: "#f59e0b", fontSize: 10 }}
            />
          ))}
          <Line
            type="monotone"
            dataKey="train"
            name="Train Loss"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="val"
            name="Val Loss"
            stroke="#a78bfa"
            strokeWidth={2}
            strokeDasharray="5 3"
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: "#e2e8f0",
  },
  toggleBtn: {
    fontSize: 11,
    padding: "3px 10px",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 4,
    color: "#94a3b8",
    cursor: "pointer",
  },
  toggleActive: {
    background: "#1d4ed8",
    borderColor: "#3b82f6",
    color: "#fff",
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
