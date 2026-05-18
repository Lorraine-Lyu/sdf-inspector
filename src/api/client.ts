import type {
  CheckpointMeta,
  Experiment,
  ExperimentDetail,
  GroundTruthGlsl,
  InferencePrediction,
  InferenceRequest,
  MetricsHistory,
  RunConfig,
  RunDetail,
  RunReview,
  SceneListing,
  SceneViewDetail,
  SlotDiagnostic,
  SlotDiagnosticListing,
  SyncStatus,
  TierListing,
  TierTagListing,
  TrainingStatus,
} from "./types";

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

/** Build a `?experiment_id=…` suffix. Run names are only unique within an
 *  experiment, so the server requires this to resolve the right run. */
function expQuery(experimentId: string): string {
  return `?experiment_id=${encodeURIComponent(experimentId)}`;
}

export const api = {
  // ── Training ──────────────────────────────────────────────────────────────
  getTrainingStatus: () => get<TrainingStatus>("/training/status"),

  // ── Experiments / runs ────────────────────────────────────────────────────
  listExperiments: () => get<Experiment[]>("/experiments"),

  getExperiment: (experimentId: string) =>
    get<ExperimentDetail>(`/experiments/${experimentId}`),

  listRuns: (experimentId: string) => get<RunConfig[]>(`/experiments/${experimentId}/runs`),

  getRun: (runId: string, experimentId: string) =>
    get<RunDetail>(`/runs/${runId}${expQuery(experimentId)}`),

  getRunReview: (runId: string, experimentId: string) =>
    get<RunReview>(`/runs/${runId}/review${expQuery(experimentId)}`),

  getRunMetrics: (
    runId: string,
    experimentId: string,
    startEpoch?: number,
    endEpoch?: number
  ) => {
    const params = new URLSearchParams();
    params.set("experiment_id", experimentId);
    if (startEpoch !== undefined) params.set("start_epoch", String(startEpoch));
    if (endEpoch !== undefined) params.set("end_epoch", String(endEpoch));
    return get<MetricsHistory>(`/runs/${runId}/metrics?${params.toString()}`);
  },

  listCheckpoints: (runId: string, experimentId: string) =>
    get<CheckpointMeta[]>(`/runs/${runId}/checkpoints${expQuery(experimentId)}`),

  // ── Slot diagnostics ──────────────────────────────────────────────────────
  listSlotDiagnostics: (runId: string, experimentId: string) =>
    get<SlotDiagnosticListing[]>(
      `/runs/${runId}/diagnostics/slots${expQuery(experimentId)}`
    ),

  getSlotDiagnostic: (runId: string, epoch: number, experimentId: string) =>
    get<SlotDiagnostic>(
      `/runs/${runId}/diagnostics/slots/${epoch}${expQuery(experimentId)}`
    ),

  // ── Scene views ───────────────────────────────────────────────────────────
  listTiers: () => get<TierListing>("/scene_views/"),

  listTierTags: (tier: string) => get<TierTagListing>(`/scene_views/${tier}/tags`),

  listScenesInTier: (
    tier: string,
    opts: { tags?: string[]; limit?: number; offset?: number } = {}
  ) => {
    const params = new URLSearchParams();
    if (opts.tags && opts.tags.length > 0) params.set("tags", opts.tags.join(","));
    if (opts.limit !== undefined) params.set("limit", String(opts.limit));
    if (opts.offset !== undefined) params.set("offset", String(opts.offset));
    const qs = params.toString();
    return get<SceneListing>(`/scene_views/${tier}${qs ? `?${qs}` : ""}`);
  },

  getSceneViewDetail: (tier: string, scene: string) =>
    get<SceneViewDetail>(`/scene_views/${tier}/${scene}`),

  getGroundTruthGlsl: (tier: string, scene: string) =>
    get<GroundTruthGlsl>(`/scene_views/${tier}/${scene}/ground_truth`),

  // ── Inference ─────────────────────────────────────────────────────────────
  runInference: (request: InferenceRequest) =>
    post<InferencePrediction>("/inference", request),

  // ── Sync ──────────────────────────────────────────────────────────────────
  getSyncStatus: () => get<SyncStatus>("/sync/status"),

  triggerSync: () => post<unknown>("/sync/pull", {}),

  fetchCheckpoint: (expId: string, runId: string, checkpointFile: string) =>
    post<unknown>("/sync/checkpoint", {
      exp_id: expId,
      run_id: runId,
      checkpoint_file: checkpointFile,
    }),
};
