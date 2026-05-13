import React from "react";
import type { SlotEntry } from "../../api/types";

interface SlotExistenceTableProps {
  slots: SlotEntry[];
}

function gapColor(gap: number | null): string {
  if (gap === null || gap === undefined) return "#565869";
  if (gap > 0.3) return "#10a37f";
  if (gap > 0.1) return "#f5a623";
  return "#ef4444";
}

function fmt(v: number | null | undefined, digits = 3): string {
  if (v === null || v === undefined || !isFinite(v)) return "—";
  return v.toFixed(digits);
}

export function SlotExistenceTable({ slots }: SlotExistenceTableProps) {
  return (
    <div style={s.table}>
      <div style={s.headerRow}>
        <span style={s.th}>Slot</span>
        <span style={s.th}>Fire</span>
        <span style={s.th}>Matched</span>
        <span style={s.th}>p|m mean</span>
        <span style={s.th}>Gap</span>
      </div>
      {slots.map((slot) => {
        const pMean = slot.p_matched_mean ?? 0;
        return (
          <div key={slot.slot} style={s.row}>
            <span style={s.mono}>#{slot.slot}</span>
            <span style={s.cell}>{(slot.fire_rate * 100).toFixed(0)}%</span>
            <span style={s.cell}>{slot.matched_count}</span>
            <span style={s.cellWide}>
              <div style={s.barTrack}>
                <div
                  style={{
                    ...s.barFill,
                    width: `${Math.max(0, Math.min(1, pMean)) * 100}%`,
                  }}
                />
              </div>
              <span style={s.barLabel}>{fmt(slot.p_matched_mean)}</span>
            </span>
            <span style={{ ...s.cell, color: gapColor(slot.gap), fontWeight: 600 }}>
              {fmt(slot.gap)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  table: { display: "flex", flexDirection: "column", gap: 0 },
  headerRow: {
    display: "grid",
    gridTemplateColumns: "60px 60px 80px 1fr 80px",
    gap: 8,
    padding: "6px 8px",
  },
  th: {
    fontSize: 11,
    color: "#565869",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "60px 60px 80px 1fr 80px",
    gap: 8,
    padding: "6px 8px",
    borderTop: "1px solid #3f3f3f",
    alignItems: "center",
  },
  mono: { fontSize: 12, color: "#10a37f", fontFamily: "ui-monospace, monospace" },
  cell: { fontSize: 12, color: "#ececec", fontVariantNumeric: "tabular-nums" },
  cellWide: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  barTrack: {
    flex: 1,
    height: 6,
    background: "#212121",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    background: "#10a37f",
  },
  barLabel: {
    fontSize: 11,
    color: "#8e8ea0",
    fontVariantNumeric: "tabular-nums",
    minWidth: 40,
    textAlign: "right",
  },
};
