import React from "react";
import { useNavigate } from "react-router-dom";
import type { SceneResultEvent, TrainingStatus } from "../api/types";

interface RecentReconstructionsProps {
  scenes: SceneResultEvent[];
  status: TrainingStatus | null;
}

export function RecentReconstructions({ scenes, status }: RecentReconstructionsProps) {
  const navigate = useNavigate();

  const handleClick = (s: SceneResultEvent) => {
    const params = new URLSearchParams();
    if (status?.run_id) params.set("runId", status.run_id);
    params.set("checkpointId", s.checkpoint_id);
    navigate(`/scene/${s.scene_id}?${params}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Reconstructions</span>
      </div>
      {scenes.length === 0 ? (
        <div style={styles.empty}>No results yet</div>
      ) : (
        <div style={styles.filmstrip}>
          {scenes.map((s, i) => (
            <div
              key={`${s.scene_id}-${s.checkpoint_id}-${i}`}
              style={styles.cell}
              onClick={() => handleClick(s)}
              title={`View ${s.scene_id}`}
            >
              <div style={styles.placeholder}>
                <span style={styles.placeholderText}>{s.scene_id}</span>
              </div>
              <div style={styles.cellLabel}>{s.scene_id}</div>
              <div style={styles.cellMeta}>
                IoU {s.metrics.iou.toFixed(2)}
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
    cursor: "pointer",
  },
  placeholder: {
    width: 96,
    height: 96,
    background: "#3f3f3f",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  },
  placeholderText: {
    color: "#8e8ea0",
    fontSize: 10,
    textAlign: "center" as const,
    wordBreak: "break-all" as const,
    padding: 4,
  },
  cellLabel: {
    fontSize: 11,
    color: "#8e8ea0",
    marginTop: 5,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  cellMeta: {
    fontSize: 10,
    color: "#565869",
    lineHeight: 1.6,
    marginTop: 2,
  },
};
