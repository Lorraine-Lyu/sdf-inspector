import React, { useState } from "react";

interface RawPredictionPanelProps {
  /** Raw per-head tensor outputs keyed by head name. Each value is rendered
   *  as JSON; the first {@link initialOpen} entries are expanded by default. */
  rawPredictions: Record<string, unknown>;
  initialOpen?: number;
}

/** Collapsible "Raw Predictions" panel that lists every raw tensor head
 *  output. Reused by the reconstruction snapshots view and (optionally)
 *  the inference playground. */
export function RawPredictionPanel({
  rawPredictions,
  initialOpen = 3,
}: RawPredictionPanelProps) {
  const keys = Object.keys(rawPredictions);
  if (keys.length === 0) {
    return <div style={s.empty}>No raw predictions in this snapshot.</div>;
  }
  return (
    <div style={s.root}>
      {keys.map((key, i) => (
        <RawRow
          key={key}
          name={key}
          value={rawPredictions[key]}
          defaultOpen={i < initialOpen}
        />
      ))}
    </div>
  );
}

function RawRow({
  name,
  value,
  defaultOpen,
}: {
  name: string;
  value: unknown;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const summary = summarize(value);
  return (
    <div style={s.row}>
      <div style={s.header} onClick={() => setOpen((v) => !v)}>
        <span style={s.arrow}>{open ? "▾" : "▸"}</span>
        <span style={s.name}>{name}</span>
        <span style={s.summary}>{summary}</span>
      </div>
      {open && <pre style={s.pre}>{formatValue(value)}</pre>}
    </div>
  );
}

function summarize(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "[] (0)";
    const inner = value[0];
    if (Array.isArray(inner)) {
      return `[${value.length} × ${inner.length}]`;
    }
    return `[${value.length}]`;
  }
  if (value === null || value === undefined) return String(value);
  if (typeof value === "object") return "{…}";
  return String(value);
}

function formatValue(value: unknown): string {
  // Pretty-print but keep flat numeric vectors on one line.
  if (Array.isArray(value) && value.every((v) => typeof v === "number" || v === null)) {
    return "[" + value.map((v) => formatNum(v)).join(", ") + "]";
  }
  return JSON.stringify(value, (_k, v) => (typeof v === "number" ? roundNum(v) : v), 2);
}

function formatNum(v: unknown): string {
  if (typeof v !== "number") return String(v);
  if (!Number.isFinite(v)) return String(v);
  return roundNum(v).toString();
}

function roundNum(v: number): number {
  if (!Number.isFinite(v)) return v;
  return Math.abs(v) >= 1000 || Math.abs(v) < 0.001
    ? Number(v.toPrecision(4))
    : Number(v.toFixed(4));
}

const s: Record<string, React.CSSProperties> = {
  root: { display: "flex", flexDirection: "column", gap: 4 },
  empty: { color: "#565869", fontSize: 12 },
  row: { background: "#2f2f2f", borderRadius: 6, overflow: "hidden" },
  header: {
    display: "grid",
    gridTemplateColumns: "16px 1fr auto",
    gap: 8,
    alignItems: "center",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: 12,
  },
  arrow: { color: "#565869" },
  name: {
    color: "#ececec",
    fontFamily: "ui-monospace, monospace",
  },
  summary: {
    color: "#8e8ea0",
    fontFamily: "ui-monospace, monospace",
    fontSize: 11,
  },
  pre: {
    margin: 0,
    padding: "6px 10px 10px",
    background: "#212121",
    fontSize: 11,
    color: "#ececec",
    fontFamily: "ui-monospace, monospace",
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
};
