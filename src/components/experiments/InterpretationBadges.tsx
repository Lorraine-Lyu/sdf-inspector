import React from "react";
import type { SlotInterpretation } from "../../api/types";

interface InterpretationBadgesProps {
  interpretation: SlotInterpretation | null | undefined;
}

export function InterpretationBadges({ interpretation }: InterpretationBadgesProps) {
  if (!interpretation) return null;
  const dead = interpretation.dead_slots ?? [];
  const weak = interpretation.weak_confidence ?? [];
  const bimodal = interpretation.bimodal ?? [];

  if (dead.length === 0 && weak.length === 0 && bimodal.length === 0) {
    return (
      <div style={s.row}>
        <Badge color="#10a37f">All slots healthy</Badge>
      </div>
    );
  }

  return (
    <div style={s.row}>
      {dead.length > 0 && (
        <Badge color="#ef4444">Dead: {dead.length} slots [{dead.join(", ")}]</Badge>
      )}
      {weak.length > 0 && (
        <Badge color="#f5a623">
          Weak confidence: {weak.length} slots [{weak.join(", ")}]
        </Badge>
      )}
      {bimodal.length > 0 && (
        <Badge color="#fb923c">
          Bimodal: {bimodal.length} slots [{bimodal.join(", ")}]
        </Badge>
      )}
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        background: `${color}1a`,
        border: `1px solid ${color}66`,
        color,
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}

const s: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
};
