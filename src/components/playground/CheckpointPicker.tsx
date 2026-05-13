import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { CheckpointMeta, Experiment, RunConfig } from "../../api/types";
import { useExperiments } from "../../hooks/useExperiments";
import { useRuns } from "../../hooks/useRuns";

export interface CheckpointSelection {
  experimentId: string;
  runId: string;
  checkpointId: string;
}

interface CheckpointPickerProps {
  selection: CheckpointSelection | null;
  onSelect: (selection: CheckpointSelection) => void;
}

export function CheckpointPicker({ selection, onSelect }: CheckpointPickerProps) {
  const { experiments } = useExperiments();
  return (
    <div>
      {experiments.length === 0 ? (
        <div style={s.muted}>No experiments yet</div>
      ) : (
        experiments.map((exp) => (
          <ExperimentBlock
            key={exp.id}
            experiment={exp}
            selection={selection}
            onSelect={onSelect}
          />
        ))
      )}
    </div>
  );
}

function ExperimentBlock({
  experiment,
  selection,
  onSelect,
}: {
  experiment: Experiment;
  selection: CheckpointSelection | null;
  onSelect: (selection: CheckpointSelection) => void;
}) {
  const [expanded, setExpanded] = useState(selection?.experimentId === experiment.id);
  const { runs } = useRuns(expanded ? experiment.id : null);

  return (
    <div style={s.block}>
      <div style={s.expRow} onClick={() => setExpanded((v) => !v)}>
        <span style={s.arrow}>{expanded ? "▾" : "▸"}</span>
        <span style={s.expName}>{experiment.name || experiment.id}</span>
      </div>
      {expanded && runs.map((run) => (
        <RunBlock
          key={run.run_id}
          experimentId={experiment.id}
          run={run}
          selection={selection}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function RunBlock({
  experimentId,
  run,
  selection,
  onSelect,
}: {
  experimentId: string;
  run: RunConfig;
  selection: CheckpointSelection | null;
  onSelect: (selection: CheckpointSelection) => void;
}) {
  const [expanded, setExpanded] = useState(selection?.runId === run.run_id);
  const [checkpoints, setCheckpoints] = useState<CheckpointMeta[]>([]);

  useEffect(() => {
    if (!expanded) return;
    api.listCheckpoints(run.run_id).then(setCheckpoints).catch(() => {});
  }, [expanded, run.run_id]);

  return (
    <div style={{ ...s.block, paddingLeft: 18 }}>
      <div style={s.expRow} onClick={() => setExpanded((v) => !v)}>
        <span style={s.arrow}>{expanded ? "▾" : "▸"}</span>
        <span style={s.runName}>{run.run_id}</span>
      </div>
      {expanded &&
        checkpoints
          .filter((c) => c.has_weights)
          .map((c) => {
            const isSelected =
              selection?.runId === run.run_id && selection.checkpointId === c.id;
            return (
              <div
                key={c.id}
                style={{
                  ...s.ckptRow,
                  background: isSelected ? "#3f3f3f" : "transparent",
                  color: isSelected ? "#ececec" : "#8e8ea0",
                }}
                onClick={() =>
                  onSelect({ experimentId, runId: run.run_id, checkpointId: c.id })
                }
              >
                {c.id}
                <span style={s.ckptMeta}>
                  ep {c.epoch}
                  {c.val_loss !== null && c.val_loss !== undefined
                    ? ` · val ${c.val_loss.toFixed(3)}`
                    : ""}
                </span>
              </div>
            );
          })}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  muted: { color: "#565869", fontSize: 13, padding: "16px 0" },
  block: { marginBottom: 2 },
  expRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 6px",
    cursor: "pointer",
    borderRadius: 6,
    userSelect: "none",
  },
  arrow: { fontSize: 10, color: "#565869", width: 12 },
  expName: { fontSize: 13, fontWeight: 500, color: "#ececec" },
  runName: { fontSize: 12, fontFamily: "ui-monospace, monospace", color: "#ececec" },
  ckptRow: {
    padding: "4px 6px 4px 28px",
    fontSize: 12,
    fontFamily: "ui-monospace, monospace",
    cursor: "pointer",
    borderRadius: 6,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ckptMeta: {
    fontSize: 10,
    color: "#565869",
  },
};
