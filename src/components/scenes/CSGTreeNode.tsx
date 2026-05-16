import type { LayoutNode } from "./CSGTreeLayout";
import { TREE_CONSTANTS } from "./CSGTreeLayout";

const NODE_COLORS = {
  leaf: { bg: "#2a3a4a", border: "#5b9bd5" },
  op: { bg: "#3a2a2a", border: "#d97b4a" },
  cluster: { bg: "#2a3a2a", border: "#4ad97b" },
} as const;

const SMOOTH_OPS = new Set(["smooth_union", "smooth_subtraction"]);

interface GTPrimitiveLike {
  type: string;
  params?: Record<string, unknown>;
}

interface CSGTreeNodeProps {
  ln: LayoutNode;
  primitives: GTPrimitiveLike[];
  highlighted: boolean;
  onHover: (id: string | null) => void;
}

function primLabel(idx: number, primitives: GTPrimitiveLike[]): string {
  const t = primitives[idx]?.type ?? "?";
  return `[${idx}] ${t}`;
}

export function CSGTreeNode({ ln, primitives, highlighted, onHover }: CSGTreeNodeProps) {
  const { node, x, y, width, height } = ln;
  const colors = NODE_COLORS[node.kind];
  const left = x - width / 2;
  const strokeWidth = highlighted ? 2.5 : 1.5;

  const hoverProps = {
    onMouseEnter: () => onHover(ln.id),
    onMouseLeave: () => onHover(null),
    style: { cursor: "default" as const },
  };

  if (node.kind === "leaf") {
    return (
      <g {...hoverProps}>
        <rect
          x={left}
          y={y}
          width={width}
          height={height}
          rx={7}
          fill={colors.bg}
          stroke={colors.border}
          strokeWidth={strokeWidth}
        />
        <text
          x={x}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontFamily="ui-monospace, monospace"
          fill="#ececec"
        >
          {primLabel(node.primitive_idx, primitives)}
        </text>
      </g>
    );
  }

  if (node.kind === "op") {
    const smooth = SMOOTH_OPS.has(node.op);
    const label = smooth ? `${node.op} (k=${node.k})` : node.op;
    return (
      <g {...hoverProps}>
        <rect
          x={left}
          y={y}
          width={width}
          height={height}
          rx={height / 2}
          fill={colors.bg}
          stroke={colors.border}
          strokeWidth={strokeWidth}
        />
        <text
          x={x}
          y={node.order_sensitive ? y + 13 : y + height / 2}
          textAnchor="middle"
          dominantBaseline={node.order_sensitive ? "auto" : "central"}
          fontSize={12}
          fontWeight={600}
          fill="#ececec"
        >
          {label}
        </text>
        {node.order_sensitive && (
          <text
            x={x}
            y={y + height - 9}
            textAnchor="middle"
            fontSize={9}
            fill="#d97b4a"
          >
            ⚠ ordered
          </text>
        )}
      </g>
    );
  }

  // cluster
  const { CLUSTER_MEMBER_W, CLUSTER_PAD } = TREE_CONSTANTS;
  const smoothCluster = SMOOTH_OPS.has(node.internal_op);
  const header = smoothCluster
    ? `cluster (${node.internal_op} k=${node.internal_k})`
    : `cluster (${node.internal_op})`;
  const headerH = 16;
  const memberY = y + headerH + 4;
  const memberH = height;
  const totalH = headerH + 4 + memberH + CLUSTER_PAD;

  return (
    <g {...hoverProps}>
      <rect
        x={left}
        y={y}
        width={width}
        height={totalH}
        rx={6}
        fill={colors.bg}
        stroke={colors.border}
        strokeWidth={strokeWidth}
        strokeDasharray="5 3"
      />
      <text
        x={left + 8}
        y={y + 11}
        fontSize={10}
        fill="#4ad97b"
        fontWeight={600}
      >
        {header}
      </text>
      {node.member_primitive_indices.map((pidx, i) => {
        const mx = left + CLUSTER_PAD + i * CLUSTER_MEMBER_W;
        return (
          <g key={pidx}>
            <rect
              x={mx}
              y={memberY}
              width={CLUSTER_MEMBER_W - 8}
              height={memberH}
              rx={5}
              fill={NODE_COLORS.leaf.bg}
              stroke={NODE_COLORS.leaf.border}
              strokeWidth={1.25}
            />
            <text
              x={mx + (CLUSTER_MEMBER_W - 8) / 2}
              y={memberY + memberH / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontFamily="ui-monospace, monospace"
              fill="#ececec"
            >
              {primLabel(pidx, primitives)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
