import React, { useMemo, useState } from "react";
import { CreateExperimentDialog } from "../components/CreateExperimentDialog";
import { ExperimentList } from "../components/ExperimentList";
import { RunComparison } from "../components/RunComparison";
import { RunDetail } from "../components/RunDetail";
import { useExperiments } from "../hooks/useExperiments";
import { useRuns } from "../hooks/useRuns";

export function Experiments() {
  const { experiments, refetch } = useExperiments();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null);
  const [compareRunIds, setCompareRunIds] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const { runs: selectedExpRuns, refetch: refetchRuns } = useRuns(selectedExpId);

  const allRuns = useMemo(() =>
    experiments.flatMap((exp) =>
      // We only have run lists for expanded experiments; build from what we have
      selectedExpId === exp.id
        ? selectedExpRuns.map((r) => ({ runId: r.run_id, experimentId: exp.id }))
        : []
    ),
    [experiments, selectedExpId, selectedExpRuns]
  );

  const handleSelectRun = (runId: string, experimentId: string) => {
    setSelectedRunId(runId);
    setSelectedExpId(experimentId);
    setComparing(false);
  };

  const handleToggleCompare = (runId: string) => {
    setCompareRunIds((prev) => {
      if (prev.includes(runId)) return prev.filter((id) => id !== runId);
      if (prev.length >= 4) return prev;
      return [...prev, runId];
    });
  };

  const handleForked = () => {
    refetch();
    refetchRuns();
  };

  return (
    <div style={s.page}>
      {/* Left panel */}
      <div style={s.left}>
        <div style={s.leftHeader}>
          <span style={s.sectionLabel}>Experiments</span>
        </div>
        <div style={s.listScroll}>
          <ExperimentList
            experiments={experiments}
            selectedRunId={selectedRunId}
            selectedRunIds={compareRunIds}
            onSelectRun={handleSelectRun}
            onToggleCompare={handleToggleCompare}
            onRefetch={refetch}
          />
        </div>
        <div style={s.leftFooter}>
          <button style={s.newBtn} onClick={() => setShowCreate(true)}>+ New Experiment</button>
          {compareRunIds.length >= 2 && (
            <button style={s.compareBtn} onClick={() => setComparing(true)}>
              Compare {compareRunIds.length} runs
            </button>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        {comparing && compareRunIds.length >= 2 ? (
          <RunComparison runIds={compareRunIds} onClose={() => setComparing(false)} />
        ) : selectedRunId ? (
          <RunDetail
            runId={selectedRunId}
            experiments={experiments}
            allRuns={allRuns}
            onForked={handleForked}
          />
        ) : (
          <div style={s.empty}>Select a run from the list</div>
        )}
      </div>

      {showCreate && (
        <CreateExperimentDialog
          onClose={() => setShowCreate(false)}
          onCreated={refetch}
        />
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { display: "flex", gap: 0, height: "100%", minHeight: "calc(100vh - 56px)" },
  left: { width: 280, minWidth: 280, borderRight: "1px solid #3f3f3f", display: "flex", flexDirection: "column", paddingRight: 0 },
  leftHeader: { padding: "0 0 12px 0" },
  sectionLabel: { fontSize: 11, color: "#565869", textTransform: "uppercase", letterSpacing: "0.06em" },
  listScroll: { flex: 1, overflowY: "auto" },
  leftFooter: { paddingTop: 14, borderTop: "1px solid #3f3f3f", display: "flex", flexDirection: "column", gap: 8 },
  newBtn: { background: "transparent", border: "1px solid #3f3f3f", borderRadius: 7, color: "#8e8ea0", padding: "7px 14px", fontSize: 13, cursor: "pointer", textAlign: "left" },
  compareBtn: { background: "#10a37f", border: "none", borderRadius: 7, color: "#fff", padding: "7px 14px", fontSize: 13, cursor: "pointer", fontWeight: 500 },
  right: { flex: 1, paddingLeft: 24, overflowY: "auto" },
  empty: { color: "#565869", fontSize: 13, paddingTop: 24 },
};
