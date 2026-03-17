import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { WS_URL } from "../api/websocket";
import type {
  AlertEvent,
  CheckpointEvent,
  MetricsHistory,
  SceneResultEvent,
  WsEvent,
} from "../api/types";
import type { TrainingStatusHook } from "./useTrainingStatus";

const EMPTY_HISTORY: MetricsHistory = {
  epochs: [],
  train_loss: [],
  val_loss: [],
  lr: [],
  component_losses: { sdf: [], eikonal: [], regularization: [] },
  curriculum_tier: [],
};

interface UseMetricsStreamOptions {
  runId: string | null;
  onStatusEvent: TrainingStatusHook["applyStatusEvent"];
  onCurriculumEvent: TrainingStatusHook["applyCurriculumEvent"];
  onMetricsUpdate: TrainingStatusHook["applyMetricsUpdate"];
  onAlert: (ev: AlertEvent) => void;
}

export function useMetricsStream({
  runId,
  onStatusEvent,
  onCurriculumEvent,
  onMetricsUpdate,
  onAlert,
}: UseMetricsStreamOptions) {
  const [metrics, setMetrics] = useState<MetricsHistory>(EMPTY_HISTORY);
  const [checkpoints, setCheckpoints] = useState<CheckpointEvent[]>([]);
  const [recentScenes, setRecentScenes] = useState<SceneResultEvent[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(3000);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  // Load historical metrics when runId changes
  useEffect(() => {
    if (!runId) {
      setMetrics(EMPTY_HISTORY);
      return;
    }
    api.getRunMetrics(runId).then(setMetrics).catch(() => {
      setMetrics(EMPTY_HISTORY);
    });
  }, [runId]);

  const connect = useCallback(() => {
    if (unmountedRef.current) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      backoffRef.current = 3000;
    };

    ws.onclose = () => {
      setWsConnected(false);
      if (!unmountedRef.current) {
        const delay = backoffRef.current;
        backoffRef.current = Math.min(delay * 2, 30000);
        retryTimerRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onmessage = (ev) => {
      let event: WsEvent;
      try {
        event = JSON.parse(ev.data as string) as WsEvent;
      } catch {
        return;
      }

      switch (event.type) {
        case "metrics": {
          const e = event;
          setMetrics((prev) => ({
            epochs: [...prev.epochs, e.epoch],
            train_loss: [...prev.train_loss, e.loss],
            val_loss: [...prev.val_loss, e.val_loss],
            lr: [...prev.lr, e.lr],
            component_losses: {
              sdf: [...prev.component_losses.sdf, e.component_losses.sdf],
              eikonal: [...prev.component_losses.eikonal, e.component_losses.eikonal],
              regularization: [
                ...prev.component_losses.regularization,
                e.component_losses.regularization,
              ],
            },
            curriculum_tier: [...prev.curriculum_tier, 0], // tier updated via curriculum events
          }));
          onMetricsUpdate(e.epoch, e.loss, e.val_loss, e.lr);
          break;
        }
        case "checkpoint":
          setCheckpoints((prev) => [...prev, event as CheckpointEvent]);
          break;
        case "scene_result":
          setRecentScenes((prev) => [(event as SceneResultEvent), ...prev].slice(0, 10));
          break;
        case "status":
          onStatusEvent(event);
          break;
        case "curriculum":
          onCurriculumEvent(event);
          break;
        case "alert":
          onAlert(event as AlertEvent);
          break;
      }
    };
  }, [onStatusEvent, onCurriculumEvent, onMetricsUpdate, onAlert]);

  useEffect(() => {
    unmountedRef.current = false;
    connect();
    return () => {
      unmountedRef.current = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { metrics, checkpoints, recentScenes, wsConnected };
}
