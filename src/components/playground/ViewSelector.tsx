import React from "react";
import type { SceneView } from "../../api/types";

const API_ORIGIN = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

interface ViewSelectorProps {
  views: SceneView[];
  selected: number[];
  onChange: (selected: number[]) => void;
}

export function ViewSelector({ views, selected, onChange }: ViewSelectorProps) {
  if (views.length === 0) return <div style={s.muted}>No views available</div>;

  const toggle = (idx: number) => {
    if (selected.includes(idx)) onChange(selected.filter((i) => i !== idx));
    else onChange([...selected, idx].sort((a, b) => a - b));
  };

  const selectAll = () => onChange(views.map((v) => v.index));

  const random = (n: number) => {
    const indices = views.map((v) => v.index);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    onChange(indices.slice(0, Math.min(n, indices.length)).sort((a, b) => a - b));
  };

  return (
    <div>
      <div style={s.controls}>
        <button style={s.btn} onClick={selectAll}>Select all</button>
        <button style={s.btn} onClick={() => random(4)}>Random 4</button>
        <span style={s.muted}>{selected.length}/{views.length} selected</span>
      </div>
      <div style={s.grid}>
        {views.map((v) => {
          const isSel = selected.includes(v.index);
          const url = v.image_url.startsWith("http")
            ? v.image_url
            : `${API_ORIGIN}${v.image_url}`;
          return (
            <label
              key={v.index}
              style={{
                ...s.cell,
                outline: isSel ? "2px solid #10a37f" : "1px solid #3f3f3f",
              }}
            >
              <input
                type="checkbox"
                checked={isSel}
                onChange={() => toggle(v.index)}
                style={s.checkbox}
              />
              <img src={url} alt={`v_${v.index}`} style={s.img} />
              <span style={s.label}>v_{String(v.index).padStart(2, "0")}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  muted: { color: "#565869", fontSize: 12 },
  controls: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  btn: {
    padding: "4px 10px",
    fontSize: 12,
    background: "transparent",
    border: "1px solid #3f3f3f",
    borderRadius: 6,
    color: "#8e8ea0",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
    gap: 6,
  },
  cell: {
    background: "#212121",
    borderRadius: 6,
    padding: 4,
    position: "relative",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  checkbox: { position: "absolute", top: 4, left: 4 },
  img: {
    width: "100%",
    aspectRatio: "1",
    objectFit: "cover",
    borderRadius: 4,
    background: "#171717",
  },
  label: {
    fontSize: 10,
    color: "#8e8ea0",
    fontFamily: "ui-monospace, monospace",
  },
};
