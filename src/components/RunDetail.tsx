import React from "react";
import type { RunConfig } from "../api/types";
import { CheckpointList } from "./CheckpointList";
import { MetricChartGrid } from "./MetricChartGrid";
import { MetricFinalValues } from "./MetricFinalValues";
import { ReviewTab } from "./ReviewTab";
import { SlotDiagnosticsTab } from "./experiments/SlotDiagnosticsTab";
import { useCheckpoints } from "../hooks/useCheckpoints";
import { useRunDetail } from "../hooks/useRunDetail";
import { useRunMetrics } from "../hooks/useRunMetrics";

export type RunTab = "config" | "metrics" | "checkpoints" | "slots" | "review";
const TABS: RunTab[] = ["config", "metrics", "checkpoints", "slots", "review"];

interface RunDetailProps {
  runId: string;
  experimentId: string | null;
  tab: RunTab;
  onTabChange: (tab: RunTab) => void;
}

export function RunDetail({ runId, experimentId, tab, onTabChange }: RunDetailProps) {
  const { run, loading } = useRunDetail(runId, experimentId);
  const { metrics } = useRunMetrics(runId, experimentId);
  const { checkpoints, refetch: refetchCheckpoints } = useCheckpoints(
    runId,
    experimentId
  );

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (!run) return <div style={s.loading}>Run not found</div>;

  const isRemote = run.config?.locality === "remote";

  return (
    <div style={s.root}>
      <div style={s.summary}>
        <div style={s.runId}>{run.id}</div>
        <div style={s.summaryRow}>
          <span style={s.meta}>Experiment: {run.experiment_id}</span>
          {checkpoints.length > 0 && (
            <span style={s.meta}>{checkpoints.length} checkpoints</span>
          )}
        </div>
      </div>

      {isRemote && (
        <div style={s.remoteBanner}>
          ⓘ This run was produced on another device. Metrics and analysis are
          available. Checkpoints must be fetched from cloud for inference.
        </div>
      )}

      <div style={s.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
            onClick={() => onTabChange(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "config" && (
        <div style={s.tabContent}>
          {run.config ? (
            <ConfigTable config={run.config} />
          ) : (
            <div style={s.muted}>No config.json found for this run.</div>
          )}
        </div>
      )}

      {tab === "metrics" && (
        <div style={s.tabContent}>
          <MetricFinalValues metrics={metrics} />
          <MetricChartGrid metrics={metrics} isLive={false} />
        </div>
      )}

      {tab === "checkpoints" && (
        <div style={s.tabContent}>
          <CheckpointList
            checkpoints={checkpoints}
            runId={runId}
            experimentId={experimentId}
            locality={run.config?.locality}
            onFetched={refetchCheckpoints}
          />
        </div>
      )}

      {tab === "slots" && (
        <div style={s.tabContent}>
          <SlotDiagnosticsTab runId={runId} experimentId={experimentId} />
        </div>
      )}

      {tab === "review" && (
        <div style={s.tabContent}>
          <ReviewTab
            runId={runId}
            experimentId={experimentId}
            active={tab === "review"}
          />
        </div>
      )}
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={s.cfgRow}>
      <span style={s.cfgLabel}>{label}</span>
      <span style={s.cfgValue}>{value}</span>
    </div>
  );
}

function ConfigTable({ config }: { config: RunConfig }) {
  return (
    <div>
      <ConfigRow label="experiment_id" value={config.experiment_id} />
      <ConfigRow label="run_id" value={config.run_id} />
      <ConfigRow label="learning_rate" value={config.learning_rate} />
      <ConfigRow label="weight_decay" value={config.weight_decay} />
      <ConfigRow label="batch_size" value={config.batch_size} />
      <ConfigRow label="num_epochs" value={config.num_epochs} />
      <ConfigRow label="lr_schedule" value={config.lr_schedule} />
      <ConfigRow label="warmup_epochs" value={config.warmup_epochs} />
      <ConfigRow label="tiers" value={config.tiers} />
      <ConfigRow label="loss_weight_type" value={config.loss_weight_type} />
      <ConfigRow label="loss_weight_params" value={config.loss_weight_params} />
      <ConfigRow label="loss_weight_translation" value={config.loss_weight_translation} />
      <ConfigRow label="loss_weight_rotation" value={config.loss_weight_rotation} />
      <ConfigRow label="loss_weight_rounding" value={config.loss_weight_rounding} />
      <ConfigRow label="no_object_weight" value={config.no_object_weight} />
      <ConfigRow label="use_focal_loss" value={String(config.use_focal_loss)} />
      <ConfigRow
        label="git_commit"
        value={
          <>
            <code style={s.code}>{config.git_commit ?? "—"}</code>
            {config.git_dirty && <span style={s.dirty}>dirty</span>}
          </>
        }
      />
      <ConfigRow
        label="created_at"
        value={config.created_at ? new Date(config.created_at).toLocaleString() : "—"}
      />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: "flex", flexDirection: "column", gap: 0, height: "100%" },
  loading: { color: "#565869", fontSize: 13, padding: 16 },
  muted: { color: "#565869", fontSize: 13 },
  remoteBanner: {
    background: "#2a2a1a",
    border: "1px solid #5b5326",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 12,
    color: "#d6c98a",
    marginBottom: 14,
    lineHeight: 1.5,
  },
  summary: {
    padding: "0 0 14px 0",
    borderBottom: "1px solid #3f3f3f",
    marginBottom: 14,
  },
  runId: { fontSize: 15, fontWeight: 600, color: "#ececec", marginBottom: 6 },
  summaryRow: { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" },
  meta: { fontSize: 12, color: "#8e8ea0" },
  tabs: { display: "flex", gap: 2, marginBottom: 14 },
  tab: {
    padding: "6px 14px",
    fontSize: 13,
    background: "transparent",
    border: "none",
    borderRadius: 6,
    color: "#565869",
    cursor: "pointer",
  },
  tabActive: { background: "#3f3f3f", color: "#ececec" },
  tabContent: { overflowY: "auto" },
  cfgRow: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: 8,
    padding: "6px 0",
    borderTop: "1px solid #3f3f3f",
  },
  cfgLabel: { fontSize: 12, color: "#8e8ea0", fontFamily: "ui-monospace, monospace" },
  cfgValue: { fontSize: 13, color: "#ececec" },
  code: { fontFamily: "ui-monospace, monospace", fontSize: 12 },
  dirty: { marginLeft: 8, color: "#f5a623", fontSize: 11 },
};
