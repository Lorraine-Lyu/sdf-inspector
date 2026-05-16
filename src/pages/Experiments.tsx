import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ExperimentList } from "../components/ExperimentList";
import { RunDetail } from "../components/RunDetail";
import { useExperiments } from "../hooks/useExperiments";

type Tab = "config" | "metrics" | "checkpoints" | "slots" | "review";
const TABS: Tab[] = ["config", "metrics", "checkpoints", "slots", "review"];

export function Experiments() {
  const { experiments } = useExperiments();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(
    searchParams.get("run")
  );
  const initialTab = (searchParams.get("tab") as Tab | null) ?? "config";
  const [tab, setTab] = useState<Tab>(TABS.includes(initialTab) ? initialTab : "config");

  // Keep URL search params in sync with selection so the dashboard's
  // "View →" deep link can target a specific run + tab.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (selectedRunId) next.set("run", selectedRunId);
    else next.delete("run");
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRunId, tab]);

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.sectionLabel}>Experiments</div>
        <div style={s.scroll}>
          <ExperimentList
            experiments={experiments}
            selectedRunId={selectedRunId}
            onSelectRun={(runId) => setSelectedRunId(runId)}
          />
        </div>
      </div>

      <div style={s.right}>
        {selectedRunId ? (
          <RunDetail runId={selectedRunId} tab={tab} onTabChange={setTab} />
        ) : (
          <div style={s.empty}>Select a run from the list</div>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { display: "flex", gap: 0, height: "100%", minHeight: "calc(100vh - 56px)" },
  left: {
    width: 280,
    minWidth: 280,
    borderRight: "1px solid #3f3f3f",
    display: "flex",
    flexDirection: "column",
    paddingRight: 0,
  },
  sectionLabel: {
    fontSize: 11,
    color: "#565869",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    paddingBottom: 12,
  },
  scroll: { flex: 1, overflowY: "auto" },
  right: { flex: 1, paddingLeft: 24, overflowY: "auto" },
  empty: { color: "#565869", fontSize: 13, paddingTop: 24 },
};
