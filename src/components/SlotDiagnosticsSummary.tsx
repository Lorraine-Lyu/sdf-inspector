import React from "react";
import { Link } from "react-router-dom";
import type { SlotDiagnostic } from "../api/types";

interface SlotDiagnosticsSummaryProps {
  runId: string | null;
  experimentId?: string | null;
  diagnostic: SlotDiagnostic | null;
  loading: boolean;
}

export function SlotDiagnosticsSummary({
  runId,
  experimentId = null,
  diagnostic,
  loading,
}: SlotDiagnosticsSummaryProps) {
  if (!runId) return null;
  if (loading) {
    return (
      <div style={s.container}>
        <span style={s.title}>Slot diagnostics</span>
        <span style={s.muted}>Loading…</span>
      </div>
    );
  }
  if (!diagnostic) return null;

  const totalSlots = diagnostic.slots.length;
  const dead = diagnostic.interpretation?.dead_slots?.length ?? 0;
  const weak = diagnostic.interpretation?.weak_confidence?.length ?? 0;
  const bimodal = diagnostic.interpretation?.bimodal?.length ?? 0;
  const active = totalSlots - dead;

  return (
    <div style={s.container}>
      <div style={s.row}>
        <span style={s.title}>Slots</span>
        <span style={s.value}>
          {active}/{totalSlots} active
        </span>
        <span style={s.sep}>·</span>
        <span style={s.muted}>
          Dead: <strong style={{ color: dead > 0 ? "#ef4444" : "#ececec" }}>{dead}</strong>
        </span>
        <span style={s.sep}>·</span>
        <span style={s.muted}>
          Weak confidence:{" "}
          <strong style={{ color: weak > 0 ? "#f5a623" : "#ececec" }}>{weak}</strong>
        </span>
        <span style={s.sep}>·</span>
        <span style={s.muted}>
          Bimodal:{" "}
          <strong style={{ color: bimodal > 0 ? "#f5a623" : "#ececec" }}>{bimodal}</strong>
        </span>
      </div>
      <div style={s.row}>
        <span style={s.muted}>Last diagnostic: epoch {diagnostic.epoch}</span>
        <Link
          to={`/experiments?run=${encodeURIComponent(runId)}${
            experimentId ? `&exp=${encodeURIComponent(experimentId)}` : ""
          }&tab=slots`}
          style={s.link}
        >
          View →
        </Link>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    background: "#2f2f2f",
    borderRadius: 10,
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    fontSize: 13,
  },
  title: {
    fontSize: 12,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  value: {
    color: "#ececec",
    fontWeight: 600,
  },
  muted: {
    color: "#8e8ea0",
  },
  sep: {
    color: "#3f3f3f",
  },
  link: {
    marginLeft: "auto",
    color: "#10a37f",
    fontSize: 13,
    textDecoration: "none",
  },
};
