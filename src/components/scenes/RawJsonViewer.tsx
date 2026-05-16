import React, { useState } from "react";

export function RawJsonViewer({ data }: { data: unknown }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div style={s.headerRow} onClick={() => setOpen((v) => !v)}>
        <span style={s.arrow}>{open ? "▼" : "▶"}</span>
        <span style={s.label}>Raw JSON</span>
      </div>
      {open && (
        <pre style={s.pre}>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 2px",
    cursor: "pointer",
    userSelect: "none",
  },
  arrow: { fontSize: 9, color: "#565869", width: 10 },
  label: {
    fontSize: 11,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  pre: {
    background: "#171717",
    borderRadius: 6,
    padding: "10px 12px",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#ececec",
    fontFamily: "ui-monospace, monospace",
    margin: "4px 0 0",
    maxHeight: 400,
    overflow: "auto",
  },
};
