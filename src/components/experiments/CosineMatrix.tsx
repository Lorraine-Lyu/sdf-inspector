import React from "react";

interface CosineMatrixProps {
  matrix: number[][];
}

export function CosineMatrix({ matrix }: CosineMatrixProps) {
  if (!matrix || matrix.length === 0) {
    return <div style={{ color: "#565869", fontSize: 12 }}>No similarity matrix</div>;
  }

  const K = matrix.length;

  return (
    <div style={s.scroll}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th} />
            {Array.from({ length: K }).map((_, j) => (
              <th key={j} style={s.th}>{j}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td style={s.rowLabel}>{i}</td>
              {row.map((v, j) => {
                const isDiagonal = i === j;
                const abs = Math.abs(v);
                const flagged = !isDiagonal && abs > 0.1;
                const intensity = isDiagonal ? 1 : abs;
                const bg = flagged
                  ? `rgba(239, 68, 68, ${0.3 + abs * 0.7})`
                  : isDiagonal
                  ? "#ececec"
                  : `rgba(255, 255, 255, ${intensity * 0.15})`;
                const fg = isDiagonal
                  ? "#171717"
                  : flagged
                  ? "#fff"
                  : intensity > 0.5
                  ? "#ececec"
                  : "#565869";
                return (
                  <td
                    key={j}
                    style={{ ...s.cell, background: bg, color: fg }}
                    title={`(${i}, ${j}) = ${v.toFixed(3)}`}
                  >
                    {v.toFixed(2)}
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
    fontSize: 10,
    fontFamily: "ui-monospace, monospace",
  },
  th: {
    padding: "4px 6px",
    color: "#565869",
    fontWeight: 500,
    fontSize: 10,
  },
  rowLabel: {
    padding: "4px 8px",
    color: "#565869",
    fontWeight: 500,
    fontSize: 10,
    borderTop: "1px solid #3f3f3f",
  },
  cell: {
    padding: "4px 6px",
    minWidth: 32,
    textAlign: "center",
    borderTop: "1px solid #3f3f3f",
    fontVariantNumeric: "tabular-nums",
  },
};
