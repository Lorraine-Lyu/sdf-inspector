import React from "react";
import { useExperimentDetail } from "../hooks/useExperimentDetail";

interface ExperimentConfigPanelProps {
  experimentId: string;
}

export function ExperimentConfigPanel({ experimentId }: ExperimentConfigPanelProps) {
  const { detail, loading, error } = useExperimentDetail(experimentId);

  if (loading) return <div style={s.loading}>Loading…</div>;
  if (error) return <div style={s.error}>{error}</div>;
  if (!detail) return null;

  const c = detail.config;
  const groups: Array<{ title: string; rows: Array<[string, React.ReactNode]> }> = [
    {
      title: "Backbone",
      rows: [
        ["backbone", c.backbone],
        ["feature_dim", c.feature_dim],
        ["pretrained_backbone", String(c.pretrained_backbone)],
        ["freeze_backbone", String(c.freeze_backbone)],
      ],
    },
    {
      title: "Model",
      rows: [
        ["max_primitives", c.max_primitives],
        ["num_primitive_types", c.num_primitive_types],
        ["max_shape_params", c.max_shape_params],
        ["transform_dim", c.transform_dim],
      ],
    },
    {
      title: "Input",
      rows: [
        ["image_size", c.image_size],
        ["num_views", c.num_views],
        ["aggregation", c.aggregation ?? "—"],
      ],
    },
    {
      title: "Camera",
      rows: [
        ["pose_encoding", c.pose_encoding],
        ["pose_input_dim", c.pose_input_dim],
        ["pose_embed_dim", c.pose_embed_dim],
        ["pose_mlp_hidden", c.pose_mlp_hidden],
      ],
    },
    {
      title: "Decoder",
      rows: [
        ["num_decoder_layers", c.num_decoder_layers],
        ["num_attention_heads", c.num_attention_heads],
        ["decoder_hidden_dim", c.decoder_hidden_dim],
        ["decoder_ffn_dim", c.decoder_ffn_dim],
        ["decoder_dropout", c.decoder_dropout],
      ],
    },
    {
      title: "Poincaré",
      rows: [
        ["use_poincare_head", String(c.use_poincare_head)],
        ["poincare_hidden_dim", c.poincare_hidden_dim],
        ["poincare_max_norm", c.poincare_max_norm],
        ["poincare_projection", c.poincare_projection],
      ],
    },
  ];

  return (
    <div style={s.root}>
      <div style={s.summary}>
        <div style={s.expName}>{detail.name || detail.id}</div>
        <div style={s.summaryRow}>
          <span style={s.meta}>Experiment: {detail.id}</span>
          <span style={s.meta}>Shared model config — select a run for details</span>
        </div>
        {detail.description && <div style={s.desc}>{detail.description}</div>}
      </div>

      {groups.map((g) => (
        <div key={g.title} style={s.group}>
          <div style={s.groupTitle}>{g.title}</div>
          {g.rows.map(([label, value]) => (
            <div key={label} style={s.cfgRow}>
              <span style={s.cfgLabel}>{label}</span>
              <span style={s.cfgValue}>{value}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: "flex", flexDirection: "column", gap: 0, height: "100%" },
  loading: { color: "#565869", fontSize: 13, padding: 16 },
  error: { color: "#ef4444", fontSize: 13, padding: 16 },
  summary: {
    padding: "0 0 14px 0",
    borderBottom: "1px solid #3f3f3f",
    marginBottom: 14,
  },
  expName: { fontSize: 15, fontWeight: 600, color: "#ececec", marginBottom: 6 },
  summaryRow: { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" },
  meta: { fontSize: 12, color: "#8e8ea0" },
  desc: { fontSize: 12, color: "#8e8ea0", marginTop: 8 },
  group: { display: "flex", flexDirection: "column", marginBottom: 18 },
  groupTitle: {
    fontSize: 11,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 600,
    marginBottom: 4,
  },
  cfgRow: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: 8,
    padding: "6px 0",
    borderTop: "1px solid #3f3f3f",
  },
  cfgLabel: { fontSize: 12, color: "#8e8ea0", fontFamily: "ui-monospace, monospace" },
  cfgValue: { fontSize: 13, color: "#ececec" },
};
