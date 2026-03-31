import React from "react";
import { NavLink, useMatch } from "react-router-dom";

interface SidebarProps {
  wsConnected: boolean;
}

export function Sidebar({ wsConnected }: SidebarProps) {
  const sceneMatch = useMatch("/scene/:sceneId");
  const sceneId = sceneMatch?.params.sceneId;

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>◈</span>
        SDF Inspector
      </div>
      <nav style={styles.nav}>
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            ...styles.navItem,
            ...(isActive ? styles.navItemActive : styles.navItemInactive),
          })}
        >
          Dashboard
        </NavLink>

        <div
          style={{
            ...styles.navItem,
            ...(sceneId ? styles.navItemActive : styles.navItemDisabled),
          }}
        >
          Scene Detail
          {sceneId && <div style={styles.navSub}>{sceneId}</div>}
        </div>

        <div style={{ ...styles.navItem, ...styles.navItemDisabled }} title="Coming in Phase 3">
          Experiments
        </div>
        <div style={{ ...styles.navItem, ...styles.navItemDisabled }}>
          Settings
        </div>
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
  navItemDisabled: {
    color: "#565869",
    cursor: "not-allowed",
  },
  navSub: {
    fontSize: 11,
    color: "#565869",
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
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
