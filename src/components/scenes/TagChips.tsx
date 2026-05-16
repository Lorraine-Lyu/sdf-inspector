import React from "react";

interface TagChipsProps {
  tags: string[];
}

/** Inline, non-interactive tag display. Mirrors the tag-filter chip style. */
export function TagChips({ tags }: TagChipsProps) {
  if (tags.length === 0) return <span style={s.empty}>none</span>;
  return (
    <div style={s.row}>
      {tags.map((t) => (
        <span key={t} style={s.chip}>
          {t}
        </span>
      ))}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  row: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: {
    fontSize: 11,
    padding: "3px 8px",
    border: "1px solid #3f3f3f",
    borderRadius: 12,
    color: "#8e8ea0",
  },
  empty: { color: "#565869", fontSize: 12 },
};
