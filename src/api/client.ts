import type { CheckpointMeta, Experiment, MetricsHistory, Reconstruction, RunConfig, RunDetail, RunReconstructionSummary, SceneDefinition, TrainingConfig, TrainingStatus } from "./types";

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000") + "/api/v1";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`GET ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`POST ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getTrainingStatus: () => get<TrainingStatus>("/training/status"),

  startTraining: (experiment_id: string, run_id?: string) =>
    post<TrainingStatus>("/training/start", { experiment_id, run_id }),

  pauseTraining: () => post<{ status: string; state: string; epoch: number }>("/training/pause"),

  resumeTraining: () => post<{ status: string; state: string; epoch: number }>("/training/resume"),

  stopTraining: () => post<{ status: string; state: string; epoch: number }>("/training/stop"),

  updateConfig: (config: Partial<TrainingConfig>) =>
    post<TrainingConfig>("/training/config", config),

  advanceCurriculum: (action: "advance" | "hold" | "auto") =>
    post("/training/curriculum", { action }),

  listExperiments: () => get<Experiment[]>("/experiments"),

  createExperiment: (body: { name: string; description?: string; config?: object }) =>
    post<Experiment>("/experiments", body),

  listRuns: (experimentId: string) => get<RunConfig[]>(`/experiments/${experimentId}/runs`),

  createRun: (experimentId: string, forkFromCheckpoint?: string) =>
    post<RunConfig>(`/experiments/${experimentId}/runs`, { fork_from_checkpoint: forkFromCheckpoint ?? null }),

  getRun: (runId: string) => get<RunDetail>(`/runs/${runId}`),

  getRunMetrics: (runId: string, startEpoch?: number, endEpoch?: number) => {
    const params = new URLSearchParams();
    if (startEpoch !== undefined) params.set("start_epoch", String(startEpoch));
    if (endEpoch !== undefined) params.set("end_epoch", String(endEpoch));
    const qs = params.toString();
    return get<MetricsHistory>(`/runs/${runId}/metrics${qs ? `?${qs}` : ""}`);
  },

  listCheckpoints: (runId: string) => get<CheckpointMeta[]>(`/runs/${runId}/checkpoints`),

  getRunReconstructions: (runId: string) =>
    get<RunReconstructionSummary[]>(`/runs/${runId}/reconstructions`),

  evaluate: (sceneIds: string[], checkpointId: string) =>
    post<{ status: string; scene_count: number }>("/scenes/evaluate", { scene_ids: sceneIds, checkpoint_id: checkpointId }),

  getScene: (sceneId: string) => get<SceneDefinition>(`/scenes/${sceneId}`),

  getReconstruction: (sceneId: string, runId: string, checkpointId?: string) => {
    const params = new URLSearchParams({ run_id: runId });
    if (checkpointId) params.set("checkpoint_id", checkpointId);
    return get<Reconstruction>(`/scenes/${sceneId}/reconstruction?${params}`);
  },
};
