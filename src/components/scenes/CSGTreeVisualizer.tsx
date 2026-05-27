import React, { useMemo, useState } from "react";
import { rotation6dToEulerDeg } from "../../utils/rotation6d";
import { CSGTreeEdge } from "./CSGTreeEdge";
import { CSGTreeNode } from "./CSGTreeNode";
import { computeLayout, type TreeNode } from "./CSGTreeLayout";

interface GTPrimitiveLike {
  type: string;
  params?: Record<string, unknown>;
  transform?: {
    translation?: number[];
    rotation_6d?: number[];
    scale?: number;
  };
}

export interface CSGTree {
  root: TreeNode;
  structural_pattern: string | null;
  max_depth: number;
  parallel_clusters?: unknown[];
}

interface CSGTreeVisualizerProps {
  csgTree: CSGTree;
  primitives: GTPrimitiveLike[];
}

const fmt = (n: unknown): string =>
  typeof n === "number" && Number.isFinite(n) ? n.toFixed(3) : String(n);

export function CSGTreeVisualizer({ csgTree, primitives }: CSGTreeVisualizerProps) {
  const layout = useMemo(() => computeLayout(csgTree.root), [csgTree.root]);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const patternLabel = `${csgTree.structural_pattern ?? "tree"} · depth ${csgTree.max_depth}`;

  const hovered = layout.nodes.find((n) => n.id === hoverId) ?? null;
  // Highlight edges out of a hovered op node; highlight the node itself otherwise.
  const highlightedEdgeIds = new Set(
    hovered && hovered.node.kind === "op"
      ? layout.edges.filter((e) => e.from === hovered.id).map((e) => e.id)
      : []
  );

  const tooltip = hovered ? tooltipFor(hovered.node, primitives) : null;

  return (
    <div style={s.wrap}>
      <div style={s.patternLabel}>{patternLabel}</div>
      <div style={s.scroll}>
        <div style={{ position: "relative", width: layout.width, height: layout.height }}>
          <svg
            width={layout.width}
            height={layout.height}
            style={{ display: "block" }}
          >
            {layout.edges.map((e) => (
              <CSGTreeEdge
                key={e.id}
                edge={e}
                highlighted={highlightedEdgeIds.has(e.id)}
              />
            ))}
            {layout.nodes.map((ln) => (
              <CSGTreeNode
                key={ln.id}
                ln={ln}
                primitives={primitives}
                highlighted={hoverId === ln.id}
                onHover={setHoverId}
              />
            ))}
          </svg>
          {hovered && tooltip && (
            <div
              style={{
                ...s.tooltip,
                left: Math.min(hovered.x + 12, layout.width - 220),
                top: hovered.y + hovered.height + 6,
              }}
            >
              {tooltip}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function tooltipFor(
  node: TreeNode,
  primitives: GTPrimitiveLike[]
): React.ReactNode {
  if (node.kind === "leaf") {
    const p = primitives[node.primitive_idx];
    if (!p) return <Row k="primitive" v={`[${node.primitive_idx}] (missing)`} />;
    const t = p.transform ?? {};
    return (
      <>
        <Row k="primitive" v={`[${node.primitive_idx}] ${p.type}`} />
        {Object.entries(p.params ?? {}).map(([k, v]) => (
          <Row key={k} k={k} v={Array.isArray(v) ? `(${v.map(fmt).join(", ")})` : fmt(v)} />
        ))}
        <Row k="translation" v={`(${(t.translation ?? [0, 0, 0]).map(fmt).join(", ")})`} />
        <Row
          k="rotation (xyz)"
          v={`(${rotation6dToEulerDeg(t.rotation_6d)
            .map((d) => `${d.toFixed(1)}°`)
            .join(", ")})`}
        />
        <Row k="scale" v={fmt(t.scale ?? 1)} />
      </>
    );
  }
  if (node.kind === "op") {
    return (
      <>
        <Row k="op" v={node.op} />
        <Row k="k" v={fmt(node.k)} />
        <Row k="order_sensitive" v={String(node.order_sensitive)} />
        <Row k="modifier_idx" v={node.modifier_idx === null ? "null" : String(node.modifier_idx)} />
      </>
    );
  }
  return (
    <>
      <Row k="cluster" v={`${node.members.length} members`} />
      <Row
        k="members"
        v={node.members
          .map((m) =>
            m.kind === "leaf"
              ? `[${m.primitive_idx}] ${primitives[m.primitive_idx]?.type ?? "?"}`
              : `(${m.kind})`
          )
          .join(", ")}
      />
      <Row k="internal_op" v={node.internal_op} />
      <Row k="internal_k" v={fmt(node.internal_k)} />
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={s.row}>
      <span style={s.k}>{k}</span>
      <span style={s.v}>{v}</span>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", flexDirection: "column", gap: 8 },
  patternLabel: {
    fontSize: 11,
    color: "#8e8ea0",
    fontFamily: "ui-monospace, monospace",
  },
  scroll: {
    overflowX: "auto",
    background: "#171717",
    border: "1px solid #2f2f2f",
    borderRadius: 8,
    padding: 8,
  },
  tooltip: {
    position: "absolute",
    minWidth: 180,
    maxWidth: 220,
    background: "#2f2f2f",
    border: "1px solid #3f3f3f",
    borderRadius: 6,
    padding: "6px 8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
    pointerEvents: "none",
    zIndex: 5,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  row: { display: "flex", justifyContent: "space-between", gap: 10, fontSize: 11 },
  k: { color: "#8e8ea0", fontFamily: "ui-monospace, monospace" },
  v: { color: "#ececec", fontFamily: "ui-monospace, monospace", textAlign: "right" },
};
