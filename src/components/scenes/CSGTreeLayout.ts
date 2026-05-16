// Top-down tree layout for the CSG tree visualizer. Trees are tiny (<=8
// primitives) so a simple span-based layout is plenty: leaves/clusters are
// terminals, op nodes sum their children's spans, x is the span center.

export type TreeNode =
  | { kind: "leaf"; primitive_idx: number }
  | {
      kind: "op";
      op: string;
      k: number;
      children: TreeNode[];
      order_sensitive: boolean;
      modifier_idx: number | null;
    }
  | {
      kind: "cluster";
      member_primitive_indices: number[];
      internal_op: string;
      internal_k: number;
    };

export type EdgeRole = "plain" | "base" | "modifier";

export interface LayoutNode {
  id: string;
  node: TreeNode;
  x: number; // center x
  y: number; // top y
  width: number;
  height: number;
}

export interface LayoutEdge {
  id: string;
  from: string; // parent node id
  to: string; // child node id
  role: EdgeRole;
  // endpoints in svg coords
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TreeLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

const UNIT_W = 160; // horizontal px per leaf-unit
const LEVEL_H = 90; // vertical px per depth level
const NODE_H = 38;
const LEAF_W = 110;
const OP_W = 130;
const CLUSTER_MEMBER_W = 78;
const CLUSTER_PAD = 14;
const MARGIN_X = 20;
const MARGIN_TOP = 8;

function clusterWidth(memberCount: number): number {
  return Math.max(LEAF_W, memberCount * CLUSTER_MEMBER_W + CLUSTER_PAD * 2);
}

/** Leaf-unit span of a subtree. Clusters reserve room for their members. */
function span(node: TreeNode): number {
  if (node.kind === "leaf") return 1;
  if (node.kind === "cluster")
    return Math.max(1, node.member_primitive_indices.length);
  return node.children.reduce((acc, c) => acc + span(c), 0) || 1;
}

/**
 * Order-sensitive op nodes always render base-LEFT, modifier-RIGHT regardless
 * of the order in `children`. `modifier_idx` indexes into `children`.
 */
function orderedChildren(node: Extract<TreeNode, { kind: "op" }>): {
  child: TreeNode;
  role: EdgeRole;
}[] {
  const kids = node.children;
  if (
    node.order_sensitive &&
    node.modifier_idx !== null &&
    kids.length === 2 &&
    node.modifier_idx >= 0 &&
    node.modifier_idx < 2
  ) {
    const modifier = kids[node.modifier_idx];
    const base = kids[node.modifier_idx === 0 ? 1 : 0];
    return [
      { child: base, role: "base" },
      { child: modifier, role: "modifier" },
    ];
  }
  return kids.map((child) => ({ child, role: "plain" as EdgeRole }));
}

export function computeLayout(root: TreeNode): TreeLayout {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  let idCounter = 0;

  // First pass: place nodes. xUnit is the left edge of this subtree in
  // leaf-units; we return the center unit so the parent can connect.
  function place(node: TreeNode, depth: number, xUnitLeft: number): { id: string; centerUnit: number } {
    const id = `n${idCounter++}`;
    const sp = span(node);
    const centerUnit = xUnitLeft + sp / 2;
    const cx = MARGIN_X + centerUnit * UNIT_W;
    const y = MARGIN_TOP + depth * LEVEL_H;

    let width = LEAF_W;
    if (node.kind === "op") width = OP_W;
    else if (node.kind === "cluster")
      width = clusterWidth(node.member_primitive_indices.length);

    nodes.push({ id, node, x: cx, y, width, height: NODE_H });

    if (node.kind === "op") {
      let cursor = xUnitLeft;
      for (const { child, role } of orderedChildren(node)) {
        const childSpan = span(child);
        const placed = place(child, depth + 1, cursor);
        cursor += childSpan;
        const childLayout = nodes.find((n) => n.id === placed.id)!;
        edges.push({
          id: `${id}-${placed.id}`,
          from: id,
          to: placed.id,
          role,
          x1: cx,
          y1: y + NODE_H,
          x2: childLayout.x,
          y2: childLayout.y,
        });
      }
    }
    return { id, centerUnit };
  }

  place(root, 0, 0);

  const maxX = Math.max(...nodes.map((n) => n.x + n.width / 2), 0);
  const maxY = Math.max(...nodes.map((n) => n.y + n.height), 0);
  return {
    nodes,
    edges,
    width: maxX + MARGIN_X,
    height: maxY + MARGIN_TOP + 24, // room for edge labels
  };
}

export const TREE_CONSTANTS = {
  CLUSTER_MEMBER_W,
  CLUSTER_PAD,
  NODE_H,
};
