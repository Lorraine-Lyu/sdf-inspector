import React, { useState } from "react";

export interface GTConnection {
  a: number;
  b: number;
  op: string;
  params?: Record<string, unknown>;
}

const fmt = (n: unknown): string =>
  typeof n === "number" && Number.isFinite(n) ? n.toFixed(3) : String(n);

export function ConnectionItem({
  connection,
  primitiveTypes,
}: {
  connection: GTConnection;
  primitiveTypes: string[];
}) {
  const [open, setOpen] = useState(false);
  const { a, b, op, params = {} } = connection;
  const typeOf = (i: number) =>
    primitiveTypes[i] !== undefined ? ` (${primitiveTypes[i]})` : "";
  const k = (params as { k?: unknown }).k;

  return (
    <div style={s.row}>
      <div style={s.headerRow} onClick={() => setOpen((v) => !v)}>
        <span style={s.arrow}>{open ? "▼" : "▶"}</span>
        <span style={s.summary}>
          [{a}] {op} → [{b}]
        </span>
      </div>
      {open && (
        <div style={s.body}>
          <div style={s.kv}>
            <span style={s.k}>a</span>
            <span style={s.v}>
              {a}
              {typeOf(a)}
            </span>
          </div>
          <div style={s.kv}>
            <span style={s.k}>b</span>
            <span style={s.v}>
              {b}
              {typeOf(b)}
            </span>
          </div>
          <div style={s.kv}>
            <span style={s.k}>op</span>
            <span style={s.v}>{op}</span>
          </div>
          <div style={s.kv}>
            <span style={s.k}>k</span>
            <span style={s.v}>{k === undefined ? "0.000" : fmt(k)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  row: { borderBottom: "1px solid #2f2f2f" },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 2px",
    cursor: "pointer",
    userSelect: "none",
  },
  arrow: { fontSize: 9, color: "#565869", width: 10 },
  summary: {
    fontSize: 12,
    color: "#ececec",
    fontFamily: "ui-monospace, monospace",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "2px 2px 8px 18px",
  },
  kv: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    fontSize: 12,
    paddingLeft: 8,
  },
  k: { color: "#8e8ea0", fontFamily: "ui-monospace, monospace" },
  v: { color: "#ececec", fontFamily: "ui-monospace, monospace" },
};
