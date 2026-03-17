export interface TrainingStatus {
  state: "idle" | "training" | "paused" | "stopped" | "error";
  experiment_id: string | null;
  run_id: string | null;
  epoch: number | null;
  loss: number | null;
  val_loss: number | null;
  lr: number | null;
  curriculum_tier: number | null;
  wall_time_seconds: number | null;
  eta_seconds: number | null;
  worker_connected: boolean;
  last_backup: {
    epoch: number;
    timestamp: string;
    success: boolean;
  } | null;
}

export interface TrainingConfig {
  learning_rate: number;
  batch_size: number;
  loss_weights: {
    sdf: number;
    eikonal: number;
    regularization: number;
  };
  lr_schedule: string;
  max_epochs: number;
  curriculum_auto_advance: boolean;
  curriculum_threshold: number;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  created_at: string;
  run_count: number;
  best_val_loss: number | null;
}

export interface MetricsHistory {
  epochs: number[];
  train_loss: number[];
  val_loss: number[];
  lr: number[];
  component_losses: {
    sdf: number[];
    eikonal: number[];
    regularization: number[];
  };
  curriculum_tier: number[];
}

// WebSocket events
export interface MetricsEvent {
  type: "metrics";
  epoch: number;
  loss: number;
  val_loss: number;
  lr: number;
  component_losses: { sdf: number; eikonal: number; regularization: number };
  wall_time: number;
}

export interface CheckpointEvent {
  type: "checkpoint";
  checkpoint_id: string;
  epoch: number;
  val_loss: number;
}

export interface SceneResultEvent {
  type: "scene_result";
  scene_id: string;
  checkpoint_id: string;
  predicted_sdf: string;
  metrics: { chamfer_distance: number; iou: number };
}

export interface StatusEvent {
  type: "status";
  state: "training" | "paused" | "stopped" | "error";
  message: string;
}

export interface CurriculumEvent {
  type: "curriculum";
  tier: number;
  trigger: "auto" | "manual";
  threshold_met: boolean;
}

export interface AlertEvent {
  type: "alert";
  severity: "info" | "warning" | "error";
  message: string;
}

export type WsEvent =
  | MetricsEvent
  | CheckpointEvent
  | SceneResultEvent
  | StatusEvent
  | CurriculumEvent
  | AlertEvent;
