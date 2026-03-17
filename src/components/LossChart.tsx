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
          Log
        </button>
      </div>
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
            scale={logScale ? "log" : "linear"}
            domain={logScale ? ["auto", "auto"] : [0, "auto"]}
            allowDataOverflow
          />
          <Tooltip
            contentStyle={{ background: "#2f2f2f", border: "none", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
            labelStyle={{ color: "#8e8ea0", fontSize: 12, marginBottom: 4 }}
            itemStyle={{ fontSize: 12, color: "#ececec" }}
            cursor={{ stroke: "#3f3f3f", strokeWidth: 1 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#8e8ea0", paddingTop: 8 }}
            iconType="plainline"
            iconSize={16}
          />
          {tierTransitions.map((ep) => (
            <ReferenceLine
              key={ep}
              x={ep}
              stroke="#565869"
              strokeDasharray="3 3"
              label={{ value: "tier↑", position: "top", fill: "#565869", fontSize: 10 }}
            />
          ))}
          <Line
            type="monotone"
            dataKey="train"
            name="Train"
            stroke="#ececec"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="val"
            name="Val"
            stroke="#8e8ea0"
            strokeWidth={1.5}
            strokeDasharray="4 2"
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: 500,
    color: "#ececec",
  },
  toggleBtn: {
    fontSize: 11,
    padding: "3px 10px",
    background: "transparent",
    border: "1px solid #3f3f3f",
    borderRadius: 6,
    color: "#8e8ea0",
    cursor: "pointer",
  },
  toggleActive: {
    background: "#3f3f3f",
    borderColor: "#565869",
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
