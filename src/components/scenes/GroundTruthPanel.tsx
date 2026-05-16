import React from "react";
import { ConnectionItem, type GTConnection } from "./ConnectionItem";
import { PrimitiveItem, type GTPrimitive } from "./PrimitiveItem";
import { RawJsonViewer } from "./RawJsonViewer";
import { TagChips } from "./TagChips";

interface GroundTruth {
  primitives?: GTPrimitive[];
  connections?: GTConnection[];
  tags?: string[];
}

interface GroundTruthPanelProps {
  groundTruth: unknown;
}

export function GroundTruthPanel({ groundTruth }: GroundTruthPanelProps) {
  if (!groundTruth || typeof groundTruth !== "object") {
    return <div style={s.muted}>No ground truth available</div>;
  }

  const gt = groundTruth as GroundTruth;
  const primitives = gt.primitives ?? [];
  const connections = gt.connections ?? [];
  const tags = gt.tags ?? [];
  const primitiveTypes = primitives.map((p) => p.type);

  return (
    <div style={s.panel}>
      <div style={s.title}>Ground Truth</div>

      <section style={s.section}>
        <div style={s.sectionHeader}>
          <span style={s.sectionLabel}>Primitives</span>
          <span style={s.badge}>{primitives.length}</span>
        </div>
        {primitives.length === 0 ? (
          <div style={s.muted}>none</div>
        ) : (
          primitives.map((p, i) => (
            <PrimitiveItem key={i} index={i} primitive={p} />
          ))
        )}
      </section>

      {connections.length > 0 && (
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionLabel}>Connections</span>
            <span style={s.badge}>{connections.length}</span>
          </div>
          {connections.map((c, i) => (
            <ConnectionItem
              key={i}
              connection={c}
              primitiveTypes={primitiveTypes}
            />
          ))}
        </section>
      )}

      <section style={s.section}>
        <div style={s.sectionHeader}>
          <span style={s.sectionLabel}>Tags</span>
        </div>
        <TagChips tags={tags} />
      </section>

      <section style={s.section}>
        <RawJsonViewer data={groundTruth} />
      </section>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    background: "#212121",
    border: "1px solid #2f2f2f",
    borderRadius: 10,
    padding: 16,
  },
  title: {
    fontSize: 11,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 600,
  },
  section: { display: "flex", flexDirection: "column", gap: 4 },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  sectionLabel: {
    fontSize: 11,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  badge: {
    fontSize: 10,
    color: "#ececec",
    background: "#3f3f3f",
    borderRadius: 8,
    padding: "1px 7px",
    minWidth: 18,
    textAlign: "center",
  },
  muted: { color: "#565869", fontSize: 12, padding: "2px 0" },
};
