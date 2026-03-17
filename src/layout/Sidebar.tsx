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
      <div style={styles.logo}>
        <span style={styles.logoIcon}>◈</span>
        SDF Inspector
      </div>
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
            background: wsConnected ? "#10a37f" : "#565869",
            boxShadow: wsConnected ? "0 0 6px #10a37f88" : "none",
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
    width: 220,
    minWidth: 220,
    background: "#171717",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "sticky",
    top: 0,
  },
  logo: {
    padding: "20px 16px 16px",
    fontSize: 14,
    fontWeight: 600,
    color: "#ececec",
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderBottom: "1px solid #2f2f2f",
  },
  logoIcon: {
    fontSize: 16,
    color: "#10a37f",
  },
  nav: {
    flex: 1,
    padding: "8px 8px",
  },
  navItem: {
    padding: "9px 12px",
    fontSize: 14,
    cursor: "pointer",
    borderRadius: 8,
    margin: "2px 0",
    transition: "background 0.1s",
  },
  navItemActive: {
    background: "#2f2f2f",
    color: "#ececec",
    fontWeight: 500,
  },
  navItemDisabled: {
    color: "#565869",
    cursor: "not-allowed",
  },
  footer: {
    padding: "14px 16px",
    borderTop: "1px solid #2f2f2f",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  },
  connLabel: {
    fontSize: 12,
    color: "#8e8ea0",
  },
};
