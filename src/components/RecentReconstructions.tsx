import React from "react";
import type { SceneResultEvent } from "../api/types";

interface RecentReconstructionsProps {
  scenes: SceneResultEvent[];
}

export function RecentReconstructions({ scenes }: RecentReconstructionsProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Recent Reconstructions</span>
        <span style={styles.badge}>Phase 2</span>
      </div>
      {scenes.length === 0 ? (
        <div style={styles.empty}>No reconstructions yet</div>
      ) : (
        <div style={styles.filmstrip}>
          {scenes.map((s, i) => (
            <div key={`${s.scene_id}-${s.checkpoint_id}-${i}`} style={styles.cell}>
              <div style={styles.placeholder}>
                <span style={styles.placeholderText}>{s.scene_id}</span>
              </div>
              <div style={styles.cellLabel}>{s.scene_id}</div>
              <div style={styles.cellMeta}>
                CD: {s.metrics.chamfer_distance.toFixed(4)}<br />
                IoU: {s.metrics.iou.toFixed(3)}
              </div>
            </div>
          ))}
        </div>
      )}
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
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: "#e2e8f0",
  },
  badge: {
    fontSize: 10,
    padding: "2px 6px",
    background: "#1d4ed822",
    border: "1px solid #1d4ed8",
    borderRadius: 4,
    color: "#60a5fa",
  },
  empty: {
    height: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#475569",
    fontSize: 13,
    border: "1px dashed #334155",
    borderRadius: 6,
  },
  filmstrip: {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    paddingBottom: 4,
  },
  cell: {
    flexShrink: 0,
    width: 100,
  },
  placeholder: {
    width: 100,
    height: 100,
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#334155",
    fontSize: 10,
    textAlign: "center",
    wordBreak: "break-all",
    padding: 4,
  },
  cellLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cellMeta: {
    fontSize: 10,
    color: "#64748b",
    lineHeight: 1.6,
  },
};
