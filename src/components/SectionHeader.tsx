import React from "react";

interface SectionHeaderProps {
  title: string;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}

export function SectionHeader({ title, right, style }: SectionHeaderProps) {
  return (
    <div style={{ ...styles.root, ...style }}>
      <div style={styles.title}>{title}</div>
      {right !== undefined && <div style={styles.right}>{right}</div>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 32,
    borderBottom: "1px solid #3f3f3f",
    paddingBottom: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: 600,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
};
