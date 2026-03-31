import React, { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MetricsHistory } from "../api/types";

const RUN_COLORS = ["#10a37f", "#6366f1", "#f59e0b", "#ef4444"];

interface ComparisonLossChartProps {
  runIds: string[];
  metricsMap: Record<string, MetricsHistory>;
}

export function ComparisonLossChart({ runIds, metricsMap }: ComparisonLossChartProps) {
  const [logScale, setLogScale] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const data = useMemo(() => {
    const epochSet = new Set<number>();
    runIds.forEach((id) => metricsMap[id]?.epochs.forEach((e) => epochSet.add(e)));
    const epochs = Array.from(epochSet).sort((a, b) => a - b);

    return epochs.map((epoch) => {
      const point: Record<string, number | null> = { epoch };
      runIds.forEach((id, i) => {
        const m = metricsMap[id];
        if (!m) return;
        const idx = m.epochs.indexOf(epoch);
        point[`train_${i}`] = idx >= 0 ? m.train_loss[idx] : null;
        point[`val_${i}`] = idx >= 0 ? m.val_loss[idx] : null;
      });
      return point;
    });
  }, [runIds, metricsMap]);

  const toggleRun = (runId: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(runId) ? next.delete(runId) : next.add(runId);
      return next;
    });
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.title}>Loss Curves</span>
        <div style={s.legend}>
          {runIds.map((id, i) => (
            <button
              key={id}
              style={{ ...s.legendBtn, opacity: hidden.has(id) ? 0.4 : 1 }}
              onClick={() => toggleRun(id)}
            >
              <span style={{ ...s.dot, background: RUN_COLORS[i % RUN_COLORS.length] }} />
              {id}
            </button>
          ))}
        </div>
        <button style={{ ...s.toggleBtn, ...(logScale ? s.toggleActive : {}) }} onClick={() => setLogScale((v) => !v)}>Log</button>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f3f" vertical={false} />
          <XAxis dataKey="epoch" stroke="transparent" tick={{ fill: "#565869", fontSize: 11 }} />
          <YAxis stroke="transparent" tick={{ fill: "#565869", fontSize: 11 }} scale={logScale ? "log" : "linear"} domain={logScale ? ["auto", "auto"] : [0, "auto"]} allowDataOverflow />
          <Tooltip contentStyle={{ background: "#2f2f2f", border: "none", borderRadius: 8 }} labelStyle={{ color: "#8e8ea0", fontSize: 12 }} itemStyle={{ fontSize: 12 }} cursor={{ stroke: "#3f3f3f" }} />
          <Legend wrapperStyle={{ display: "none" }} />
          {runIds.map((id, i) => {
            const color = RUN_COLORS[i % RUN_COLORS.length];
            const hide = hidden.has(id);
            return [
              <Line key={`train_${i}`} type="monotone" dataKey={`train_${i}`} name={`${id} train`} stroke={color} strokeWidth={1.5} dot={false} connectNulls hide={hide} />,
              <Line key={`val_${i}`} type="monotone" dataKey={`val_${i}`} name={`${id} val`} stroke={color} strokeWidth={1.5} strokeDasharray="4 2" dot={false} connectNulls hide={hide} />,
            ];
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { background: "#2f2f2f", borderRadius: 10, padding: "16px 16px 12px" },
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" },
  title: { fontSize: 13, fontWeight: 500, color: "#ececec" },
  legend: { display: "flex", gap: 8, flexWrap: "wrap", flex: 1 },
  legendBtn: { background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#8e8ea0", padding: 0 },
  dot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  toggleBtn: { fontSize: 11, padding: "3px 10px", background: "transparent", border: "1px solid #3f3f3f", borderRadius: 6, color: "#8e8ea0", cursor: "pointer" },
  toggleActive: { background: "#3f3f3f", color: "#ececec" },
};
