// ─── Status (data/status.json) ──────────────────────────────────────────────

export type TrainingState = "idle" | "training" | "stopped" | "error" | "stale";

export interface TrainingStatus {
  state: TrainingState;
  experiment_id: string | null;
  run_id: string | null;
  epoch: number | null;
  train_loss: number | null;
  val_loss: number | null;
  lr: number | null;
  max_tier: number | null;
  wall_time_seconds: number | null;
  eta_seconds: number | null;
  updated_at: string | null;
}

// Deprecated alias kept for compile-compat with older comparison/diff components.
export type RunStatus = TrainingStatus;

// ─── Metrics ────────────────────────────────────────────────────────────────

/**
 * Columnar metrics matching `metrics.jsonl` field names. The server returns
 * exactly these keys (plus optional Poincaré fields). The signature `[k: string]:
 * number[]` lets the websocket appender handle additional unknown columns.
 */
export interface MetricsHistory {
  epochs: number[];
  train_loss: number[];
  val_loss: number[];
  train_type_acc: number[];
  train_exist_acc: number[];
  train_trans_mae: number[];
  train_rot_err_deg: number[];
  train_rounding_loss: number[];
  val_type_acc: number[];
  val_exist_acc: number[];
  val_trans_mae: number[];
  val_rot_err_deg: number[];
  val_param_loss: number[];
  val_rounding_loss: number[];
  val_num_matched: number[];
  lr: number[];
  elapsed_sec: number[];
  train_p_depth: number[];
  train_p_prox: number[];
  train_p_op: number[];
  train_p_k: number[];
  val_p_depth: number[];
  val_p_prox: number[];
  val_p_op: number[];
  val_p_k: number[];
  [key: string]: number[];
}

export const EMPTY_METRICS: MetricsHistory = {
  epochs: [],
  train_loss: [],
  val_loss: [],
  train_type_acc: [],
  train_exist_acc: [],
  train_trans_mae: [],
  train_rot_err_deg: [],
  train_rounding_loss: [],
  val_type_acc: [],
  val_exist_acc: [],
  val_trans_mae: [],
  val_rot_err_deg: [],
  val_param_loss: [],
  val_rounding_loss: [],
  val_num_matched: [],
  lr: [],
  elapsed_sec: [],
  train_p_depth: [],
  train_p_prox: [],
  train_p_op: [],
  train_p_k: [],
  val_p_depth: [],
  val_p_prox: [],
  val_p_op: [],
  val_p_k: [],
};

// ─── Configs ────────────────────────────────────────────────────────────────

export interface ExperimentConfig {
  backbone: string;
  feature_dim: number;
  pretrained_backbone: boolean;
  freeze_backbone: boolean;
  max_primitives: number;
  num_primitive_types: number;
  max_shape_params: number;
  transform_dim: number;
  image_size: number;
  num_views: number;
  pose_encoding: string;
  pose_input_dim: number;
  pose_embed_dim: number;
  pose_mlp_hidden: number;
  num_decoder_layers: number;
  num_attention_heads: number;
  decoder_hidden_dim: number;
  decoder_ffn_dim: number;
  decoder_dropout: number;
  use_poincare_head: boolean;
  poincare_hidden_dim: number;
  poincare_max_norm: number;
  poincare_projection: string;
}

export interface RunConfig {
  experiment_id: string;
  run_id: string;
  created_at: string;
  git_commit: string | null;
  git_dirty: boolean;
  forked_from_checkpoint: string | null;
  learning_rate: number;
  weight_decay: number;
  batch_size: number;
  num_epochs: number;
  lr_schedule: string;
  warmup_epochs: number;
  loss_weight_type: number;
  loss_weight_params: number;
  loss_weight_translation: number;
  loss_weight_rotation: number;
  loss_weight_rounding: number;
  loss_weight_poincare_depth: number;
  loss_weight_poincare_proximity: number;
  loss_weight_poincare_op: number;
  loss_weight_poincare_k: number;
  no_object_weight: number;
  use_focal_loss: boolean;
  focal_alpha: number;
  focal_gamma: number;
  data_dir: string;
  rendered_dir: string;
  tiers: string;
  tier_scene_counts?: Record<string, number> | null;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  created_at: string;
  run_count: number;
  best_val_loss: number | null;
}

export interface ExperimentDetail {
  id: string;
  name: string;
  description: string;
  created_at: string | null;
  config: ExperimentConfig & { aggregation?: string };
}

export interface RunDetail {
  id: string;
  experiment_id: string;
  config: RunConfig | null;
}

export interface RunReview {
  content: string | null;
}

// ─── Checkpoints ────────────────────────────────────────────────────────────

export interface CheckpointMeta {
  id: string;
  epoch: number;
  val_loss: number | null;
  has_weights: boolean;
}

// ─── Scene views ────────────────────────────────────────────────────────────

export interface TierListing {
  tiers: Array<{ name: string; scene_count: number }>;
}

export interface SceneListing {
  tier: string;
  total: number;
  scenes: string[];
}

export interface TierTag {
  tag: string;
  count: number;
}

export interface TierTagListing {
  tier: string;
  tags: TierTag[];
}

export interface SceneCamera {
  index: number;
  position: [number, number, number];
  world_to_cam?: number[][];
  intrinsics?: number[][];
}

export interface SceneView {
  index: number;
  image_url: string;
  camera: SceneCamera | null;
}

export interface SceneViewDetail {
  tier: string;
  scene: string;
  view_count: number;
  views: SceneView[];
  ground_truth: unknown;
}

export interface GroundTruthGlsl {
  glsl: string;
}

// ─── Slot diagnostics ───────────────────────────────────────────────────────

export interface SlotEntry {
  slot: number;
  fire_rate: number;
  matched_count: number;
  p_matched_mean: number | null;
  p_matched_p10: number | null;
  p_matched_p50: number | null;
  p_matched_p90: number | null;
  p_unmatched_mean: number;
  gap: number | null;
  type_histogram: Record<string, number>;
  top_type: string | null;
  concentration: number | null;
  mean_position: [number, number, number] | null;
}

export interface SlotInterpretation {
  dead_slots: number[];
  weak_confidence: number[];
  bimodal: number[];
}

export interface SlotDiagnostic {
  epoch: number;
  num_scenes: number;
  tier_filter: string;
  slots: SlotEntry[];
  cosine_similarity: number[][];
  interpretation: SlotInterpretation;
  per_tier?: Array<{
    tier_filter: string;
    num_scenes: number;
    slots: SlotEntry[];
  }>;
}

export interface SlotDiagnosticListing {
  epoch: number;
  file: string;
}

// ─── Inference ──────────────────────────────────────────────────────────────

export interface InferenceRequest {
  run_id: string;
  experiment_id: string;
  checkpoint_id: string;
  scene_path: string;
  view_indices?: number[];
}

export interface SlotPrediction {
  slot_index: number;
  existence: number;
  predicted_type: string;
  type_confidences: Record<string, number>;
  params: Record<string, number>;
  transform: {
    position: [number, number, number];
    rotation_6d: number[];
    scale: number;
  };
  warp: unknown | null;
  connections: unknown[] | null;
}

export interface InferencePrediction {
  slots: SlotPrediction[];
  predicted_sdf: string;
  metadata: Record<string, unknown>;
}

// ─── WebSocket events ───────────────────────────────────────────────────────

/** A `metrics` event is the original metrics.jsonl row with `type: "metrics"` added. */
export interface MetricsEvent {
  type: "metrics";
  epoch: number;
  [key: string]: number | string | null | undefined;
}

/** A `status` event is the contents of data/status.json with `type: "status"` added. */
export interface StatusEvent extends Omit<TrainingStatus, "state"> {
  type: "status";
  state: TrainingState;
}

export interface DiagnosticEvent {
  type: "diagnostic";
  epoch: number;
  file: string;
}

export interface AlertEvent {
  type: "alert";
  severity: "info" | "warning" | "error";
  message: string;
}

export type WsEvent = MetricsEvent | StatusEvent | DiagnosticEvent | AlertEvent;

// ─── Misc ───────────────────────────────────────────────────────────────────

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}
