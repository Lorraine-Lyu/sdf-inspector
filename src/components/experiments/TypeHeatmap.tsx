import React, { useMemo } from "react";
import type { SlotEntry } from "../../api/types";

interface TypeHeatmapProps {
  slots: SlotEntry[];
}

export function TypeHeatmap({ slots }: TypeHeatmapProps) {
  const types = useMemo(() => {
    const set = new Set<string>();
    for (const slot of slots) {
      for (const t of Object.keys(slot.type_histogram ?? {})) set.add(t);
    }
    return Array.from(set).sort();
  }, [slots]);

  const maxCount = useMemo(() => {
    let m = 0;
    for (const slot of slots) {
      for (const c of Object.values(slot.type_histogram ?? {})) {
        if (c > m) m = c;
      }
    }
    return m || 1;
  }, [slots]);

  if (types.length === 0) {
    return <div style={{ color: "#565869", fontSize: 12 }}>No type histogram</div>;
  }

  return (
    <div style={s.scroll}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Slot · top · conc.</th>
            {types.map((t) => (
              <th key={t} style={s.th}>{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.slot}>
              <td style={s.rowLabel}>
                <div style={s.rowLabelMain}>
                  #{slot.slot} <span style={s.rowLabelTop}>{slot.top_type ?? "—"}</span>
                </div>
                <div style={s.rowLabelMeta}>
                  conc. {slot.concentration !== null && slot.concentration !== undefined
                    ? slot.concentration.toFixed(2)
                    : "—"}
                </div>
              </td>
              {types.map((t) => {
                const count = slot.type_histogram?.[t] ?? 0;
                const intensity = count / maxCount;
                const isTop = slot.top_type === t;
                return (
                  <td
                    key={t}
                    style={{
                      ...s.cell,
                      background: `rgba(16, 163, 127, ${intensity * 0.85})`,
                      outline: isTop && count > 0 ? "1px solid #10a37f" : undefined,
                      color: intensity > 0.5 ? "#fff" : "#ececec",
                    }}
                    title={`${t}: ${count}`}
                  >
                    {count > 0 ? count : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  scroll: { overflowX: "auto" },
  table: {
    borderCollapse: "collapse",
    fontSize: 11,
    color: "#ececec",
    minWidth: "100%",
  },
  th: {
    padding: "6px 8px",
    fontSize: 10,
    color: "#8e8ea0",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "left",
  },
  rowLabel: {
    padding: "6px 8px",
    borderTop: "1px solid #3f3f3f",
    fontSize: 11,
    color: "#ececec",
    minWidth: 140,
  },
  rowLabelMain: {
    fontFamily: "ui-monospace, monospace",
  },
  rowLabelTop: {
    color: "#10a37f",
    marginLeft: 6,
  },
  rowLabelMeta: { color: "#565869", marginTop: 2 },
  cell: {
    padding: "6px 8px",
    borderTop: "1px solid #3f3f3f",
    textAlign: "center",
    fontVariantNumeric: "tabular-nums",
    minWidth: 36,
  },
};
