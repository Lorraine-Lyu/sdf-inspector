import React from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  wsConnected: boolean;
  children: React.ReactNode;
}

export function Layout({ wsConnected, children }: LayoutProps) {
  return (
    <div style={styles.root}>
      <Sidebar wsConnected={wsConnected} />
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#212121",
    color: "#ececec",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  main: {
    flex: 1,
    padding: "28px 32px",
    overflowY: "auto",
    minWidth: 0,
    maxWidth: 1200,
  },
};
