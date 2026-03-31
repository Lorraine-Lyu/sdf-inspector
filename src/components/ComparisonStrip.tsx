import React from "react";
import type { ReconstructionMetrics } from "../api/types";

interface ComparisonStripProps {
  metrics: ReconstructionMetrics | null;
}

export function ComparisonStrip({ metrics }: ComparisonStripProps) {
  if (!metrics) return null;

  return (
    <div style={styles.row}>
      <div style={styles.card}>
        <span style={styles.label}>Chamfer</span>
        <span style={styles.value}>{metrics.chamfer_distance.toFixed(4)}</span>
      </div>
      <div style={styles.card}>
        <span style={styles.label}>IoU</span>
        <span style={styles.value}>{metrics.iou.toFixed(4)}</span>
      </div>
      <div style={styles.card}>
        <span style={styles.label}>Loss</span>
        <span style={styles.value}>{metrics.loss.toFixed(4)}</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    gap: 12,
    marginTop: 12,
  },
  card: {
    background: "#2f2f2f",
    borderRadius: 8,
    padding: "10px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: "#8e8ea0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  value: {
    fontSize: 16,
    fontWeight: 600,
    color: "#ececec",
    fontVariantNumeric: "tabular-nums",
  },
};
