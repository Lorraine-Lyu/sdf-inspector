import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricsHistory } from "../api/types";

export interface MetricSeriesSpec {
  /** Field name in MetricsHistory. */
  key: string;
  /** Series label shown in legend / tooltip. */
  label: string;
  /** Stroke color. */
  color: string;
  /** Optional dash array for the line (e.g., "4 2" for dashed). */
  dash?: string;
}

export interface MetricLineChartProps {
  title: string;
  metrics: MetricsHistory;
  series: MetricSeriesSpec[];
  /** Optional log toggle. */
  logToggle?: boolean;
  /** Hide chart entirely if every series is all-zero or empty. */
  hideIfAllZero?: boolean;
  /** Override the default empty message. */
  emptyMessage?: string;
  height?: number;
}

function isAllZero(values: number[]): boolean {
  return values.length > 0 && values.every((v) => v === 0 || v === null || v === undefined);
}

export function MetricLineChart({
  title,
  metrics,
  series,
  logToggle = false,
  hideIfAllZero = false,
  emptyMessage = "No data",
  height = 220,
}: MetricLineChartProps) {
  const [logScale, setLogScale] = useState(false);

  const data = useMemo(() => {
    return metrics.epochs.map((epoch, i) => {
      const row: Record<string, number | null> = { epoch };
      for (const s of series) {
        const col = metrics[s.key] as number[] | undefined;
        row[s.key] = col?.[i] ?? null;
      }
      return row;
    });
  }, [metrics, series]);

  const allZero =
    hideIfAllZero &&
    series.every((s) => isAllZero((metrics[s.key] as number[] | undefined) ?? []));

  if (allZero) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        {logToggle && (
          <button
            style={{ ...styles.toggleBtn, ...(logScale ? styles.toggleActive : {}) }}
            onClick={() => setLogScale((v) => !v)}
          >
            Log
          </button>
        )}
      </div>
      {data.length === 0 ? (
        <div style={{ ...styles.empty, height }}>{emptyMessage}</div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
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
              domain={logScale ? ["auto", "auto"] : ["auto", "auto"]}
              allowDataOverflow
            />
            <Tooltip
              contentStyle={{
                background: "#2f2f2f",
                border: "none",
                borderRadius: 8,
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}
              labelStyle={{ color: "#8e8ea0", fontSize: 12, marginBottom: 4 }}
              itemStyle={{ fontSize: 12, color: "#ececec" }}
              cursor={{ stroke: "#3f3f3f", strokeWidth: 1 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#8e8ea0", paddingTop: 8 }}
              iconType="plainline"
              iconSize={16}
            />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={1.5}
                strokeDasharray={s.dash}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#565869",
    fontSize: 13,
  },
};
