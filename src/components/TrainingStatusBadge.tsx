import React from "react";
import type { TrainingStatus } from "../api/types";

function formatRelativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

interface TrainingStatusBadgeProps {
  status: TrainingStatus | null;
}

export function TrainingStatusBadge({ status }: TrainingStatusBadgeProps) {
  if (!status) {
    return <Badge color="#565869">Loading…</Badge>;
  }
  switch (status.state) {
    case "idle":
      return <Badge color="#565869">No active training</Badge>;
    case "training":
      return (
        <Badge color="#10a37f" pulse>
          Training — epoch {status.epoch ?? "?"}
        </Badge>
      );
    case "stopped":
      return (
        <Badge color="#565869">Stopped at epoch {status.epoch ?? "?"}</Badge>
      );
    case "error":
      return (
        <Badge color="#ef4444">Error at epoch {status.epoch ?? "?"}</Badge>
      );
    case "stale":
      return (
        <Badge color="#f5a623">
          Training stale — last update{" "}
          {status.updated_at ? formatRelativeTime(status.updated_at) : "unknown"}
        </Badge>
      );
    default:
      return <Badge color="#565869">{String(status.state)}</Badge>;
  }
}

interface BadgeProps {
  color: string;
  children: React.ReactNode;
  pulse?: boolean;
}

function Badge({ color, children, pulse }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "#2f2f2f",
        color,
        fontSize: 13,
        fontWeight: 500,
        padding: "6px 14px",
        borderRadius: 8,
        border: `1px solid ${color}33`,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          boxShadow: pulse ? `0 0 8px ${color}` : "none",
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  );
}
