import React, { useState } from "react";
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
import { copyJson } from "../utils/clipboard";

export interface MetricChartLine {
  dataKey: string;
  label: string;
  color: string;
  dashed?: boolean;
}

export interface MetricChartProps {
  title: string;
  data: Array<Record<string, number | null>>;
  lines: MetricChartLine[];
  height?: number;
}

function buildExport(
  title: string,
  data: Array<Record<string, number | null>>,
  lines: MetricChartLine[]
) {
  const series: Record<string, (number | null)[]> = {};
  for (const line of lines) {
    series[line.label] = data.map((row) => row[line.dataKey] ?? null);
  }
  return {
    title,
    epochs: data.map((row) => row.epoch),
    series,
  };
}

export function MetricChart({ title, data, lines, height = 180 }: MetricChartProps) {
  const showLegend = lines.length > 1;
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const ok = await copyJson(buildExport(title, data, lines));
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>{title}</div>
        <button
          style={styles.copyBtn}
          onClick={onCopy}
          title="Copy chart data as JSON"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" vertical={false} />
          <XAxis
            dataKey="epoch"
            stroke="transparent"
            tick={{ fill: "#565869", fontSize: 10 }}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: "#565869", fontSize: 10 }}
            width={48}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "#2f2f2f",
              border: "none",
              borderRadius: 8,
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
            labelStyle={{ color: "#8e8ea0", fontSize: 11, marginBottom: 2 }}
            itemStyle={{ fontSize: 11, color: "#ececec" }}
            cursor={{ stroke: "#3f3f3f", strokeWidth: 1 }}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#8e8ea0", paddingTop: 4 }}
              iconType="plainline"
              iconSize={14}
            />
          )}
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.label}
              stroke={line.color}
              strokeWidth={1.5}
              strokeDasharray={line.dashed ? "5 5" : undefined}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#2f2f2f",
    borderRadius: 10,
    padding: "10px 12px 6px",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: 500,
    color: "#ececec",
  },
  copyBtn: {
    fontSize: 10,
    padding: "2px 8px",
    background: "transparent",
    border: "1px solid #3f3f3f",
    borderRadius: 5,
    color: "#8e8ea0",
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
};
