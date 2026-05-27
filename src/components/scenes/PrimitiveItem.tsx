import React, { useState } from "react";
import { rotation6dToEulerDeg } from "../../utils/rotation6d";

export interface GTTransform {
  translation?: number[];
  rotation_6d?: number[];
  scale?: number;
}

export interface GTPrimitive {
  type: string;
  params?: Record<string, unknown>;
  transform?: GTTransform;
  warp?: unknown;
  rounding?: number;
}

const fmt = (n: unknown): string =>
  typeof n === "number" && Number.isFinite(n) ? n.toFixed(3) : String(n);

const degFmt = (d: number): string =>
  Number.isFinite(d) ? `${d.toFixed(1)}°` : String(d);

function paramValue(v: unknown): string {
  if (Array.isArray(v)) return `(${v.map(fmt).join(", ")})`;
  return fmt(v);
}

export function PrimitiveItem({
  index,
  primitive,
}: {
  index: number;
  primitive: GTPrimitive;
}) {
  const [open, setOpen] = useState(false);
  const t = primitive.transform ?? {};
  const translation = t.translation ?? [0, 0, 0];
  const rotation6d = t.rotation_6d;
  const eulerDeg = rotation6dToEulerDeg(rotation6d);
  const scale = t.scale ?? 1.0;
  const params = primitive.params ?? {};

  return (
    <div style={s.row}>
      <div style={s.headerRow} onClick={() => setOpen((v) => !v)}>
        <span style={s.arrow}>{open ? "▼" : "▶"}</span>
        <span style={s.idx}>[{index}]</span>
        <span style={s.type}>{primitive.type}</span>
      </div>
      {open && (
        <div style={s.body}>
          <div style={s.groupLabel}>Params:</div>
          {Object.keys(params).length === 0 ? (
            <div style={s.kv}>
              <span style={s.muted}>none</span>
            </div>
          ) : (
            Object.entries(params).map(([k, v]) => (
              <div key={k} style={s.kv}>
                <span style={s.k}>{k}</span>
                <span style={s.v}>{paramValue(v)}</span>
              </div>
            ))
          )}

          <div style={s.groupLabel}>Transform:</div>
          <div style={s.kv}>
            <span style={s.k}>translation</span>
            <span style={s.v}>({translation.map(fmt).join(", ")})</span>
          </div>
          <div style={s.kv}>
            <span style={s.k}>rotation (xyz)</span>
            <span style={s.v}>({eulerDeg.map(degFmt).join(", ")})</span>
          </div>
          {rotation6d && (
            <div style={s.kv}>
              <span style={s.k}>rotation_6d</span>
              <span style={s.v}>({rotation6d.map(fmt).join(", ")})</span>
            </div>
          )}
          <div style={s.kv}>
            <span style={s.k}>scale</span>
            <span style={s.v}>{fmt(scale)}</span>
          </div>

          <div style={s.kv}>
            <span style={s.k}>warp</span>
            <span style={s.v}>
              {primitive.warp == null
                ? "none"
                : JSON.stringify(primitive.warp)}
            </span>
          </div>
          <div style={s.kv}>
            <span style={s.k}>rounding</span>
            <span style={s.v}>{fmt(primitive.rounding ?? 0)}</span>
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
  idx: {
    fontSize: 12,
    color: "#8e8ea0",
    fontFamily: "ui-monospace, monospace",
  },
  type: { fontSize: 13, color: "#ececec", fontWeight: 500 },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "2px 2px 8px 18px",
  },
  groupLabel: {
    fontSize: 11,
    color: "#8e8ea0",
    marginTop: 6,
    marginBottom: 2,
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
  muted: { color: "#565869", fontSize: 12 },
};
