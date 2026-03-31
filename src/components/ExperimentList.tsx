import React, { useState } from "react";
import type { Experiment, RunConfig } from "../api/types";
import { useRuns } from "../hooks/useRuns";

interface ExperimentListProps {
  experiments: Experiment[];
  selectedRunId: string | null;
  selectedRunIds: string[];
  onSelectRun: (runId: string, experimentId: string) => void;
  onToggleCompare: (runId: string) => void;
  onRefetch: () => void;
}

function StateDot({ state }: { state: string }) {
  const colors: Record<string, string> = { training: "#10a37f", paused: "#f5a623", stopped: "#565869", error: "#ef4444" };
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: colors[state] ?? "#565869", display: "inline-block", flexShrink: 0 }} />;
}

function RunRow({ run, selected, inCompare, onSelect, onToggle }: {
  run: RunConfig; selected: boolean; inCompare: boolean;
  onSelect: () => void; onToggle: () => void;
}) {
  return (
    <div
      style={{ ...rs.row, background: selected ? "#3f3f3f" : "transparent" }}
      onClick={onSelect}
    >
      <input
        type="checkbox"
        checked={inCompare}
        onClick={(e) => e.stopPropagation()}
        onChange={onToggle}
        style={{ flexShrink: 0 }}
      />
      <StateDot state="stopped" />
      <span style={rs.runId}>{run.run_id}</span>
      <span style={rs.meta}>{run.config.max_epochs} ep</span>
    </div>
  );
}

function ExperimentRow({ exp, selectedRunId, selectedRunIds, onSelectRun, onToggleCompare }: {
  exp: Experiment;
  selectedRunId: string | null;
  selectedRunIds: string[];
  onSelectRun: (runId: string, experimentId: string) => void;
  onToggleCompare: (runId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { runs } = useRuns(expanded ? exp.id : null);

  return (
    <div style={es.expBlock}>
      <div style={es.expRow} onClick={() => setExpanded((v) => !v)}>
        <span style={es.arrow}>{expanded ? "▾" : "▸"}</span>
        <div style={es.expInfo}>
          <span style={es.expName}>{exp.name}</span>
          <span style={es.expMeta}>
            {exp.run_count} run{exp.run_count !== 1 ? "s" : ""}
            {exp.best_val_loss !== null && ` · best ${exp.best_val_loss.toFixed(4)}`}
          </span>
        </div>
      </div>
      {expanded && runs.map((run) => (
        <RunRow
          key={run.run_id}
          run={run}
          selected={selectedRunId === run.run_id}
          inCompare={selectedRunIds.includes(run.run_id)}
          onSelect={() => onSelectRun(run.run_id, exp.id)}
          onToggle={() => onToggleCompare(run.run_id)}
        />
      ))}
    </div>
  );
}

export function ExperimentList({ experiments, selectedRunId, selectedRunIds, onSelectRun, onToggleCompare }: ExperimentListProps) {
  if (experiments.length === 0) {
    return <div style={{ color: "#565869", fontSize: 13, padding: "16px 0" }}>No experiments yet</div>;
  }
  return (
    <div>
      {experiments.map((exp) => (
        <ExperimentRow
          key={exp.id}
          exp={exp}
          selectedRunId={selectedRunId}
          selectedRunIds={selectedRunIds}
          onSelectRun={onSelectRun}
          onToggleCompare={onToggleCompare}
        />
      ))}
    </div>
  );
}

const es: Record<string, React.CSSProperties> = {
  expBlock: { marginBottom: 4 },
  expRow: { display: "flex", alignItems: "center", gap: 8, padding: "8px 6px", cursor: "pointer", borderRadius: 6, userSelect: "none" },
  arrow: { fontSize: 10, color: "#565869", width: 12 },
  expInfo: { display: "flex", flexDirection: "column", gap: 2 },
  expName: { fontSize: 13, fontWeight: 500, color: "#ececec" },
  expMeta: { fontSize: 11, color: "#565869" },
};

const rs: Record<string, React.CSSProperties> = {
  row: { display: "flex", alignItems: "center", gap: 8, padding: "6px 6px 6px 22px", cursor: "pointer", borderRadius: 6 },
  runId: { fontSize: 12, color: "#8e8ea0", flex: 1, fontFamily: "ui-monospace, monospace" },
  meta: { fontSize: 11, color: "#565869" },
};
