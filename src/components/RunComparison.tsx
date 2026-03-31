import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import type { MetricsHistory, RunReconstructionSummary } from "../api/types";
import { ComparisonLossChart } from "./ComparisonLossChart";
import { ComparisonSceneTable } from "./ComparisonSceneTable";

interface RunComparisonProps {
  runIds: string[];
  onClose: () => void;
}

export function RunComparison({ runIds, onClose }: RunComparisonProps) {
  const [metricsMap, setMetricsMap] = useState<Record<string, MetricsHistory>>({});
  const [reconstructionsMap, setReconstructionsMap] = useState<Record<string, RunReconstructionSummary[]>>({});

  useEffect(() => {
    runIds.forEach((id) => {
      api.getRunMetrics(id).then((m) => setMetricsMap((prev) => ({ ...prev, [id]: m }))).catch(() => {});
      api.getRunReconstructions(id).then((r) => setReconstructionsMap((prev) => ({ ...prev, [id]: r }))).catch(() => {});
    });
  }, [runIds]);

  return (
    <div style={s.root}>
      <div style={s.header}>
        <span style={s.title}>Comparing: {runIds.join(", ")}</span>
        <button style={s.closeBtn} onClick={onClose}>✕ Close Comparison</button>
      </div>
      <ComparisonLossChart runIds={runIds} metricsMap={metricsMap} />
      <ComparisonSceneTable runIds={runIds} reconstructionsMap={reconstructionsMap} />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: "flex", flexDirection: "column", gap: 14 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  title: { fontSize: 13, color: "#ececec", fontWeight: 500 },
  closeBtn: { background: "transparent", border: "1px solid #3f3f3f", borderRadius: 7, color: "#8e8ea0", padding: "5px 12px", fontSize: 12, cursor: "pointer" },
};
