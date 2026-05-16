import type { LayoutEdge } from "./CSGTreeLayout";

const MODIFIER_COLOR = "#d97b4a";
const PLAIN_COLOR = "#565869";

interface CSGTreeEdgeProps {
  edge: LayoutEdge;
  highlighted: boolean;
}

export function CSGTreeEdge({ edge, highlighted }: CSGTreeEdgeProps) {
  const { x1, y1, x2, y2, role } = edge;
  const isModifier = role === "modifier";
  const color = isModifier ? MODIFIER_COLOR : PLAIN_COLOR;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  // Smooth cubic so crossing edges read clearly.
  const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={highlighted ? 2.5 : 1.5}
        strokeDasharray={isModifier ? "5 4" : undefined}
        opacity={highlighted ? 1 : 0.85}
      />
      {role !== "plain" && (
        <text
          x={midX}
          y={midY}
          textAnchor="middle"
          fontSize={9}
          fill={color}
          style={{ paintOrder: "stroke" }}
          stroke="#212121"
          strokeWidth={3}
        >
          {role}
        </text>
      )}
    </g>
  );
}
