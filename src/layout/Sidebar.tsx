import React from "react";

interface SidebarProps {
  wsConnected: boolean;
}

const navItems = [
  { label: "Dashboard", path: "/", active: true },
  { label: "Scene Catalog", path: "/scenes", active: false, tooltip: "Coming in Phase 2" },
  { label: "Experiments", path: "/experiments", active: false, tooltip: "Coming in Phase 3" },
  { label: "Settings", path: "/settings", active: false },
];

export function Sidebar({ wsConnected }: SidebarProps) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>SDF Inspector</div>
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <div
            key={item.label}
            title={!item.active ? item.tooltip : undefined}
            style={{
              ...styles.navItem,
              ...(item.active ? styles.navItemActive : styles.navItemDisabled),
            }}
          >
            {item.label}
          </div>
        ))}
      </nav>
      <div style={styles.footer}>
        <span
          style={{
            ...styles.dot,
            background: wsConnected ? "#10b981" : "#ef4444",
          }}
        />
        <span style={styles.connLabel}>
          {wsConnected ? "Live" : "Disconnected"}
        </span>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 200,
    minWidth: 200,
    background: "#111827",
    borderRight: "1px solid #1f2937",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "sticky",
    top: 0,
  },
  logo: {
    padding: "20px 16px 16px",
    fontSize: 15,
    fontWeight: 700,
    color: "#f9fafb",
    borderBottom: "1px solid #1f2937",
  },
  nav: {
    flex: 1,
    padding: "8px 0",
  },
  navItem: {
    padding: "10px 16px",
    fontSize: 14,
    cursor: "pointer",
    borderRadius: 4,
    margin: "2px 8px",
  },
  navItemActive: {
    background: "#1f2937",
    color: "#f9fafb",
    fontWeight: 600,
  },
  navItemDisabled: {
    color: "#4b5563",
    cursor: "not-allowed",
  },
  footer: {
    padding: "16px",
    borderTop: "1px solid #1f2937",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  },
  connLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
};
