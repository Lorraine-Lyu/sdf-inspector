import React, { useMemo, useState } from "react";
import type { RunReconstructionSummary } from "../api/types";

const RUN_COLORS = ["#10a37f", "#6366f1", "#f59e0b", "#ef4444"];

interface ComparisonSceneTableProps {
  runIds: string[];
  reconstructionsMap: Record<string, RunReconstructionSummary[]>;
}

export function ComparisonSceneTable({ runIds, reconstructionsMap }: ComparisonSceneTableProps) {
  const [sortCol, setSortCol] = useState<string>("scene_id");
  const [sortAsc, setSortAsc] = useState(true);

  const rows = useMemo(() => {
    const sceneSet = new Set<string>();
    runIds.forEach((id) => reconstructionsMap[id]?.forEach((r) => sceneSet.add(r.scene_id)));
    return Array.from(sceneSet).map((sceneId) => {
      const ious: (number | null)[] = runIds.map((id) => {
        const match = reconstructionsMap[id]?.find((r) => r.scene_id === sceneId);
        return match ? match.metrics.iou : null;
      });
      const validIous = ious.filter((v): v is number => v !== null);
      const bestIou = validIous.length ? Math.max(...validIous) : null;
      const worstIou = validIous.length > 1 ? Math.min(...validIous) : null;
      return { sceneId, ious, bestIou, worstIou };
    });
  }, [runIds, reconstructionsMap]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortCol === "scene_id") { va = a.sceneId; vb = b.sceneId; }
      else {
        const i = runIds.indexOf(sortCol);
        va = a.ious[i] ?? -1;
        vb = b.ious[i] ?? -1;
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [rows, sortCol, sortAsc, runIds]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setAsc((v) => !v);
    else { setSortCol(col); setSortAsc(false); }
  };
  const setAsc = setSortAsc;

  if (rows.length === 0) return <div style={s.empty}>No reconstructions available</div>;

  return (
    <div style={s.wrapper}>
      <div style={{ ...s.grid, gridTemplateColumns: `180px repeat(${runIds.length}, 1fr) 80px` }}>
        <span style={{ ...s.th, cursor: "pointer" }} onClick={() => toggleSort("scene_id")}>Scene {sortCol === "scene_id" ? (sortAsc ? "↑" : "↓") : ""}</span>
        {runIds.map((id, i) => (
          <span key={id} style={{ ...s.th, color: RUN_COLORS[i % RUN_COLORS.length], cursor: "pointer" }} onClick={() => toggleSort(id)}>
            {id} {sortCol === id ? (sortAsc ? "↑" : "↓") : ""}
          </span>
        ))}
        <span style={s.th}>Best</span>
      </div>
      {sorted.map(({ sceneId, ious, bestIou, worstIou }) => (
        <div key={sceneId} style={{ ...s.grid, ...s.row, gridTemplateColumns: `180px repeat(${runIds.length}, 1fr) 80px` }}>
          <span style={s.sceneId}>{sceneId}</span>
          {ious.map((iou, i) => {
            const isBest = iou !== null && iou === bestIou && runIds.length > 1;
            const isWorst = iou !== null && iou === worstIou && runIds.length > 1;
            return (
              <span key={i} style={{ ...s.cell, color: isBest ? "#6ee7b7" : isWorst ? "#fca5a5" : "#8e8ea0", background: isBest ? "#1a3b2a" : isWorst ? "#3b1f1f" : "transparent" }}>
                {iou !== null ? iou.toFixed(3) : "—"}
              </span>
            );
          })}
          <span style={s.cell}>
            {bestIou !== null ? runIds[ious.indexOf(bestIou)] : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { background: "#2f2f2f", borderRadius: 10, padding: "16px 16px 12px", overflowX: "auto" },
  grid: { display: "grid", gap: 8, alignItems: "center" },
  th: { fontSize: 11, color: "#565869", textTransform: "uppercase", letterSpacing: "0.05em", padding: "6px 4px", userSelect: "none" },
  row: { borderTop: "1px solid #3f3f3f", padding: "7px 4px" },
  sceneId: { fontSize: 12, color: "#ececec", fontFamily: "ui-monospace, monospace" },
  cell: { fontSize: 12, padding: "2px 5px", borderRadius: 4 },
  empty: { color: "#565869", fontSize: 13, padding: "16px 0" },
};
