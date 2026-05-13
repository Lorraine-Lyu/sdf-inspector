import React from "react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  wsConnected: boolean;
}

const NAV_ITEMS: Array<{ to: string; label: string; end?: boolean }> = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/experiments", label: "Experiments" },
  { to: "/scenes", label: "Scenes" },
  { to: "/playground", label: "Playground" },
];

export function Sidebar({ wsConnected }: SidebarProps) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>◈</span>
        SDF Inspector
      </div>
      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : styles.navItemInactive),
            })}
          >
            {item.label}
          </NavLink>
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
        <span style={styles.connLabel}>{wsConnected ? "Live" : "Disconnected"}</span>
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
    borderRadius: 8,
    margin: "2px 0",
    display: "block",
    textDecoration: "none",
  },
  navItemActive: {
    background: "#2f2f2f",
    color: "#ececec",
    fontWeight: 500,
  },
  navItemInactive: {
    color: "#8e8ea0",
    cursor: "pointer",
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
