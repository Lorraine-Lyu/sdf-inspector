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
    background: "#0f172a",
    color: "#e2e8f0",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  main: {
    flex: 1,
    padding: 24,
    overflowY: "auto",
    minWidth: 0,
  },
};
