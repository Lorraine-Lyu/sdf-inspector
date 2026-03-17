import type { Experiment, MetricsHistory, TrainingConfig, TrainingStatus } from "./types";

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

  stopTraining: () => post<{ status: string; state: string; epoch: number }>("/training/stop"),

  updateConfig: (config: Partial<TrainingConfig>) =>
    post<TrainingConfig>("/training/config", config),

  advanceCurriculum: (action: "advance" | "hold" | "auto") =>
    post("/training/curriculum", { action }),

  listExperiments: () => get<Experiment[]>("/experiments"),

  getRunMetrics: (runId: string) => get<MetricsHistory>(`/runs/${runId}/metrics`),
};
