import React from "react";
import type { SceneResultEvent } from "../api/types";

interface RecentReconstructionsProps {
  scenes: SceneResultEvent[];
}

export function RecentReconstructions({ scenes }: RecentReconstructionsProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Reconstructions</span>
        <span style={styles.badge}>Phase 2</span>
      </div>
      {scenes.length === 0 ? (
        <div style={styles.empty}>No results yet</div>
      ) : (
        <div style={styles.filmstrip}>
          {scenes.map((s, i) => (
            <div key={`${s.scene_id}-${s.checkpoint_id}-${i}`} style={styles.cell}>
              <div style={styles.placeholder}>
                <span style={styles.placeholderText}>{s.scene_id}</span>
              </div>
              <div style={styles.cellLabel}>{s.scene_id}</div>
              <div style={styles.cellMeta}>
                CD {s.metrics.chamfer_distance.toFixed(3)} · IoU {s.metrics.iou.toFixed(2)}
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
    background: "#2f2f2f",
    borderRadius: 10,
    padding: "16px 16px 12px",
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
    fontWeight: 500,
    color: "#ececec",
  },
  badge: {
    fontSize: 10,
    padding: "2px 7px",
    background: "#3f3f3f",
    borderRadius: 4,
    color: "#565869",
    fontWeight: 500,
  },
  empty: {
    height: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#565869",
    fontSize: 13,
    border: "1px dashed #3f3f3f",
    borderRadius: 8,
  },
  filmstrip: {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    paddingBottom: 4,
  },
  cell: {
    flexShrink: 0,
    width: 96,
  },
  placeholder: {
    width: 96,
    height: 96,
    background: "#3f3f3f",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#565869",
    fontSize: 10,
    textAlign: "center",
    wordBreak: "break-all",
    padding: 4,
  },
  cellLabel: {
    fontSize: 11,
    color: "#8e8ea0",
    marginTop: 5,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cellMeta: {
    fontSize: 10,
    color: "#565869",
    lineHeight: 1.6,
    marginTop: 2,
  },
};
