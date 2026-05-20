import React, { useState } from "react";
import type { Experiment, RunConfig } from "../api/types";
import { useRuns } from "../hooks/useRuns";

interface ExperimentListProps {
  experiments: Experiment[];
  selectedRunId: string | null;
  selectedExperimentId: string | null;
  activeRunId: string | null;
  onSelectRun: (runId: string, experimentId: string) => void;
  onSelectExperiment: (experimentId: string) => void;
}

function RunRow({
  run,
  selected,
  active,
  onSelect,
}: {
  run: RunConfig;
  selected: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const remote = run.locality === "remote";
  return (
    <div
      style={{ ...rs.row, background: selected ? "#3f3f3f" : "transparent" }}
      onClick={onSelect}
    >
      <span style={rs.runId}>{run.run_id}</span>
      {active && (
        <span
          style={{
            ...rs.badge,
            color: "#e09f3e",
            borderColor: "#8a6324",
          }}
          title="Currently training"
        >
          running
        </span>
      )}
      <span
        style={{
          ...rs.badge,
          color: remote ? "#8e8ea0" : "#10a37f",
          borderColor: remote ? "#3f3f3f" : "#1f6f5c",
        }}
        title={
          remote
            ? "Pulled from cloud — no local checkpoints"
            : "Checkpoints present on this device"
        }
      >
        {remote ? "remote" : "local"}
      </span>
      <span style={rs.meta}>
        {run.num_epochs ?? "—"} ep · tiers {run.tiers ?? "?"}
      </span>
    </div>
  );
}

function ExperimentRow({
  exp,
  selectedRunId,
  selectedExperimentId,
  activeRunId,
  onSelectRun,
  onSelectExperiment,
}: {
  exp: Experiment;
  selectedRunId: string | null;
  selectedExperimentId: string | null;
  activeRunId: string | null;
  onSelectRun: (runId: string, experimentId: string) => void;
  onSelectExperiment: (experimentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { runs } = useRuns(expanded ? exp.id : null);
  const expSelected = selectedExperimentId === exp.id && !selectedRunId;

  return (
    <div style={es.expBlock}>
      <div
        style={{
          ...es.expRow,
          background: expSelected ? "#3f3f3f" : "transparent",
        }}
        onClick={() => {
          setExpanded((v) => !v);
          onSelectExperiment(exp.id);
        }}
      >
        <span style={es.arrow}>{expanded ? "▾" : "▸"}</span>
        <div style={es.expInfo}>
          <span style={es.expName}>{exp.name || exp.id}</span>
          <span style={es.expMeta}>
            {exp.run_count} run{exp.run_count !== 1 ? "s" : ""}
            {exp.best_val_loss !== null && ` · best ${exp.best_val_loss.toFixed(4)}`}
          </span>
        </div>
      </div>
      {expanded &&
        runs.map((run) => (
          <RunRow
            key={run.run_id}
            run={run}
            selected={selectedRunId === run.run_id}
            active={activeRunId === run.run_id}
            onSelect={() => onSelectRun(run.run_id, exp.id)}
          />
        ))}
    </div>
  );
}

export function ExperimentList({
  experiments,
  selectedRunId,
  selectedExperimentId,
  activeRunId,
  onSelectRun,
  onSelectExperiment,
}: ExperimentListProps) {
  if (experiments.length === 0) {
    return (
      <div style={{ color: "#565869", fontSize: 13, padding: "16px 0" }}>
        No experiments yet
      </div>
    );
  }
  return (
    <div>
      {experiments.map((exp) => (
        <ExperimentRow
          key={exp.id}
          exp={exp}
          selectedRunId={selectedRunId}
          selectedExperimentId={selectedExperimentId}
          activeRunId={activeRunId}
          onSelectRun={onSelectRun}
          onSelectExperiment={onSelectExperiment}
        />
      ))}
    </div>
  );
}

const es: Record<string, React.CSSProperties> = {
  expBlock: { marginBottom: 4 },
  expRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 6px",
    cursor: "pointer",
    borderRadius: 6,
    userSelect: "none",
  },
  arrow: { fontSize: 10, color: "#565869", width: 12 },
  expInfo: { display: "flex", flexDirection: "column", gap: 2 },
  expName: { fontSize: 13, fontWeight: 500, color: "#ececec" },
  expMeta: { fontSize: 11, color: "#565869" },
};

const rs: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 6px 6px 22px",
    cursor: "pointer",
    borderRadius: 6,
  },
  runId: {
    fontSize: 12,
    color: "#8e8ea0",
    flex: 1,
    fontFamily: "ui-monospace, monospace",
  },
  badge: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    border: "1px solid",
    borderRadius: 8,
    padding: "1px 6px",
  },
  meta: { fontSize: 11, color: "#565869" },
};
