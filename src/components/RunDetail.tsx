import React, { useState } from "react";
import type { Experiment, RunDetail as RunDetailType } from "../api/types";
import { CheckpointList } from "./CheckpointList";
import { ConfigDiff } from "./ConfigDiff";
import { LossChart } from "./LossChart";
import { LossDecomposition } from "./LossDecomposition";
import { LRChart } from "./LRChart";
import { useCheckpoints } from "../hooks/useCheckpoints";
import { useRunDetail } from "../hooks/useRunDetail";
import { useRunMetrics } from "../hooks/useRunMetrics";

interface RunDetailProps {
  runId: string;
  experiments: Experiment[];
  allRuns: { runId: string; experimentId: string }[];
  onForked: () => void;
}

type Tab = "config" | "metrics" | "checkpoints";

function StateBadge({ state }: { state: string }) {
  const colors: Record<string, string> = { training: "#10a37f", paused: "#f5a623", stopped: "#565869", error: "#ef4444" };
  const color = colors[state] ?? "#565869";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      {state}
    </span>
  );
}

function ConfigRow({ label, value, mono = false, warn = false }: { label: string; value: React.ReactNode; mono?: boolean; warn?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 8, padding: "6px 0", borderTop: "1px solid #3f3f3f" }}>
      <span style={{ fontSize: 12, color: "#8e8ea0" }}>{label}</span>
      <span style={{ fontSize: 13, color: warn ? "#f5a623" : "#ececec", fontFamily: mono ? "ui-monospace, monospace" : undefined }}>
        {value}
      </span>
    </div>
  );
}

export function RunDetail({ runId, experiments, allRuns, onForked }: RunDetailProps) {
  const { run, loading } = useRunDetail(runId);
  const { metrics } = useRunMetrics(runId);
  const { checkpoints, refetch: refetchCheckpoints } = useCheckpoints(runId);
  const [tab, setTab] = useState<Tab>("config");
  const [diffRunId, setDiffRunId] = useState<string>("");
  const { run: diffRun } = useRunDetail(diffRunId || null);

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (!run) return <div style={s.loading}>Select a run</div>;

  const c = run.config;

  return (
    <div style={s.root}>
      <div style={s.summary}>
        <div style={s.runId}>{run.id}</div>
        <div style={s.summaryRow}>
          <StateBadge state={run.state} />
          <span style={s.meta}>Epochs: {run.epochs_completed}</span>
          {run.best_val_loss !== null && <span style={s.meta}>Best val loss: {run.best_val_loss.toFixed(4)}</span>}
        </div>
      </div>

      <div style={s.tabs}>
        {(["config", "metrics", "checkpoints"] as Tab[]).map((t) => (
          <button key={t} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "config" && (
        <div style={s.tabContent}>
          {!diffRun ? (
            <>
              <ConfigRow label="Model Architecture" value={c.model_architecture ?? "—"} />
              <ConfigRow label="Learning Rate" value={c.learning_rate} mono />
              <ConfigRow label="Batch Size" value={c.batch_size} mono />
              <ConfigRow label="LR Schedule" value={c.lr_schedule} />
              <ConfigRow label="Loss Weights" value={`sdf: ${c.loss_weights.sdf}, eikonal: ${c.loss_weights.eikonal}, reg: ${c.loss_weights.regularization}`} mono />
              <ConfigRow label="Max Epochs" value={c.max_epochs} mono />
              <ConfigRow label="Curriculum Auto" value={c.curriculum_auto_advance ? "yes" : "no"} />
              <ConfigRow label="Curriculum Threshold" value={c.curriculum_threshold} mono />
              <ConfigRow
                label="Git Commit"
                value={<><code style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{run.git_commit ?? "—"}</code>{run.git_dirty && <span style={{ marginLeft: 8, color: "#f5a623", fontSize: 11 }}>dirty</span>}</>}
              />
              <ConfigRow label="Created At" value={new Date(run.created_at).toLocaleString()} />

              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#8e8ea0" }}>Diff with:</span>
                <select
                  style={s.select}
                  value={diffRunId}
                  onChange={(e) => setDiffRunId(e.target.value)}
                >
                  <option value="">Select run…</option>
                  {allRuns.filter((r) => r.runId !== runId).map((r) => (
                    <option key={r.runId} value={r.runId}>{r.runId}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <button style={s.backBtn} onClick={() => setDiffRunId("")}>← Back to config</button>
              <ConfigDiff runA={run} runB={diffRun} />
            </>
          )}
        </div>
      )}

      {tab === "metrics" && (
        <div style={s.tabContent}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <LossChart metrics={metrics} runId={runId} />
            <LRChart metrics={metrics} runId={runId} />
            <LossDecomposition metrics={metrics} runId={runId} />
          </div>
        </div>
      )}

      {tab === "checkpoints" && (
        <div style={s.tabContent}>
          <CheckpointList
            checkpoints={checkpoints}
            runId={runId}
            experimentId={run.experiment_id}
            experiments={experiments}
            onForked={() => { refetchCheckpoints(); onForked(); }}
          />
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: "flex", flexDirection: "column", gap: 0, height: "100%" },
  loading: { color: "#565869", fontSize: 13, padding: 16 },
  summary: { padding: "0 0 14px 0", borderBottom: "1px solid #3f3f3f", marginBottom: 14 },
  runId: { fontSize: 15, fontWeight: 600, color: "#ececec", marginBottom: 6 },
  summaryRow: { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" },
  meta: { fontSize: 12, color: "#8e8ea0" },
  tabs: { display: "flex", gap: 2, marginBottom: 14 },
  tab: { padding: "6px 14px", fontSize: 13, background: "transparent", border: "none", borderRadius: 6, color: "#565869", cursor: "pointer" },
  tabActive: { background: "#3f3f3f", color: "#ececec" },
  tabContent: { overflowY: "auto" },
  select: { background: "#212121", border: "1px solid #3f3f3f", borderRadius: 6, color: "#ececec", padding: "4px 8px", fontSize: 12, outline: "none" },
  backBtn: { background: "transparent", border: "none", color: "#8e8ea0", fontSize: 12, cursor: "pointer", padding: "0 0 12px 0", display: "block" },
};
