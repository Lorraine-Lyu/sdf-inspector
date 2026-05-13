import React, { useState } from "react";
import type { SlotPrediction } from "../../api/types";

interface SlotCardProps {
  slot: SlotPrediction;
}

export function SlotCard({ slot }: SlotCardProps) {
  const isActive = slot.existence > 0.5;
  const [open, setOpen] = useState(isActive);

  const sortedTypes = Object.entries(slot.type_confidences ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div style={{ ...s.card, opacity: isActive ? 1 : 0.5 }}>
      <div style={s.header} onClick={() => setOpen((v) => !v)}>
        <span style={s.arrow}>{open ? "▾" : "▸"}</span>
        <span style={s.slotId}>#{slot.slot_index}</span>
        <span style={s.bar}>
          <span
            style={{
              ...s.barFill,
              width: `${Math.max(0, Math.min(1, slot.existence)) * 100}%`,
              background: isActive ? "#10a37f" : "#565869",
            }}
          />
        </span>
        <span style={s.exist}>{(slot.existence * 100).toFixed(0)}%</span>
        <span style={s.type}>{slot.predicted_type}</span>
      </div>

      {open && (
        <div style={s.body}>
          <Section label="Type confidences">
            {sortedTypes.map(([t, p]) => (
              <Bar key={t} label={t} value={p} />
            ))}
          </Section>

          <Section label="Params">
            <pre style={s.pre}>{JSON.stringify(slot.params, null, 2)}</pre>
          </Section>

          <Section label="Transform">
            <div style={s.kv}>
              <span style={s.k}>position</span>
              <span style={s.v}>[{slot.transform.position.map((x) => x.toFixed(3)).join(", ")}]</span>
              <span style={s.k}>scale</span>
              <span style={s.v}>{slot.transform.scale.toFixed(3)}</span>
              <span style={s.k}>rot 6D</span>
              <span style={s.v}>[{slot.transform.rotation_6d.map((x) => x.toFixed(2)).join(", ")}]</span>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={s.section}>
      <div style={s.sectionLabel}>{label}</div>
      {children}
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div style={s.barRow}>
      <span style={s.barLabel}>{label}</span>
      <span style={{ ...s.bar, flex: 1 }}>
        <span
          style={{
            ...s.barFill,
            width: `${Math.max(0, Math.min(1, value)) * 100}%`,
            background: "#10a37f",
          }}
        />
      </span>
      <span style={s.barValue}>{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  card: {
    background: "#2f2f2f",
    borderRadius: 8,
    overflow: "hidden",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "16px 40px 1fr 50px 100px",
    gap: 8,
    alignItems: "center",
    padding: "8px 12px",
    cursor: "pointer",
  },
  arrow: { fontSize: 10, color: "#565869" },
  slotId: { fontSize: 12, fontFamily: "ui-monospace, monospace", color: "#10a37f" },
  bar: {
    height: 4,
    background: "#212121",
    borderRadius: 2,
    overflow: "hidden",
    display: "block",
  },
  barFill: { display: "block", height: "100%" },
  exist: {
    fontSize: 11,
    color: "#ececec",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
  type: { fontSize: 12, color: "#ececec", textAlign: "right" },
  body: {
    padding: "8px 12px",
    borderTop: "1px solid #3f3f3f",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  section: { display: "flex", flexDirection: "column", gap: 4 },
  sectionLabel: {
    fontSize: 10,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  pre: {
    background: "#212121",
    borderRadius: 4,
    padding: "6px 10px",
    fontSize: 11,
    color: "#ececec",
    margin: 0,
    overflowX: "auto",
  },
  kv: {
    display: "grid",
    gridTemplateColumns: "70px 1fr",
    gap: "2px 8px",
    fontSize: 11,
  },
  k: { color: "#8e8ea0" },
  v: { color: "#ececec", fontFamily: "ui-monospace, monospace" },
  barRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
  },
  barLabel: {
    width: 80,
    color: "#ececec",
    fontFamily: "ui-monospace, monospace",
  },
  barValue: {
    width: 40,
    textAlign: "right",
    color: "#8e8ea0",
    fontVariantNumeric: "tabular-nums",
  },
};
