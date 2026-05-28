import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { WS_URL } from "../api/websocket";
import type {
  AlertEvent,
  DiagnosticEvent,
  MetricsEvent,
  MetricsHistory,
  SnapshotEvent,
  SyncCompleteEvent,
  WsEvent,
} from "../api/types";
import { EMPTY_METRICS } from "../api/types";
import type { TrainingStatusHook } from "./useTrainingStatus";

interface UseMetricsStreamOptions {
  runId: string | null;
  experimentId: string | null;
  onStatusEvent: TrainingStatusHook["applyStatusEvent"];
  onMetricsUpdate: TrainingStatusHook["applyMetricsUpdate"];
  onDiagnostic?: (ev: DiagnosticEvent) => void;
  onAlert?: (ev: AlertEvent) => void;
  onSyncComplete?: (ev: SyncCompleteEvent) => void;
  onSnapshot?: (ev: SnapshotEvent) => void;
}

/** Append every numeric field of a metrics event to the history.
 *  - `epoch` lands in `epochs`; everything else is keyed by name.
 *  - Strings (e.g. `exist_diag`) are dropped — only number columns are charted. */
function appendMetricsEvent(prev: MetricsHistory, ev: MetricsEvent): MetricsHistory {
  const next: MetricsHistory = { ...prev };
  next.epochs = [...prev.epochs, ev.epoch];
  for (const [key, value] of Object.entries(ev)) {
    if (key === "type" || key === "epoch") continue;
    if (typeof value !== "number") continue;
    const column = (next[key] as number[] | undefined) ?? [];
    next[key] = [...column, value];
  }
  return next;
}

export function useMetricsStream({
  runId,
  experimentId,
  onStatusEvent,
  onMetricsUpdate,
  onDiagnostic,
  onAlert,
  onSyncComplete,
  onSnapshot,
}: UseMetricsStreamOptions) {
  const [metrics, setMetrics] = useState<MetricsHistory>(EMPTY_METRICS);
  const [latestDiagnosticEpoch, setLatestDiagnosticEpoch] = useState<number | null>(null);
  const [latestSnapshotEpoch, setLatestSnapshotEpoch] = useState<number | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(3000);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  // Load historical metrics whenever the active run changes.
  useEffect(() => {
    if (!runId || !experimentId) {
      setMetrics(EMPTY_METRICS);
      setLatestDiagnosticEpoch(null);
      setLatestSnapshotEpoch(null);
      return;
    }
    api
      .getRunMetrics(runId, experimentId)
      .then((m) => setMetrics({ ...EMPTY_METRICS, ...m }))
      .catch(() => setMetrics(EMPTY_METRICS));
    api
      .listSlotDiagnostics(runId, experimentId)
      .then((list) => {
        if (list.length === 0) {
          setLatestDiagnosticEpoch(null);
        } else {
          setLatestDiagnosticEpoch(list[list.length - 1].epoch);
        }
      })
      .catch(() => setLatestDiagnosticEpoch(null));
    api
      .listSnapshots(runId, experimentId)
      .then((list) => {
        if (list.length === 0) {
          setLatestSnapshotEpoch(null);
        } else {
          setLatestSnapshotEpoch(list[list.length - 1].epoch);
        }
      })
      .catch(() => setLatestSnapshotEpoch(null));
  }, [runId, experimentId]);

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

    ws.onerror = () => ws.close();

    ws.onmessage = (raw) => {
      let event: WsEvent;
      try {
        event = JSON.parse(raw.data as string) as WsEvent;
      } catch {
        return;
      }

      switch (event.type) {
        case "metrics": {
          setMetrics((prev) => appendMetricsEvent(prev, event));
          const { epoch, train_loss, val_loss, lr } = event as MetricsEvent;
          onMetricsUpdate({
            epoch: typeof epoch === "number" ? epoch : null,
            train_loss: typeof train_loss === "number" ? train_loss : null,
            val_loss: typeof val_loss === "number" ? val_loss : null,
            lr: typeof lr === "number" ? lr : null,
          });
          break;
        }
        case "status":
          onStatusEvent(event);
          break;
        case "diagnostic":
          setLatestDiagnosticEpoch(event.epoch);
          onDiagnostic?.(event);
          break;
        case "alert":
          onAlert?.(event);
          break;
        case "sync_complete":
          onSyncComplete?.(event);
          break;
        case "snapshot":
          setLatestSnapshotEpoch(event.epoch);
          onSnapshot?.(event);
          break;
      }
    };
  }, [onStatusEvent, onMetricsUpdate, onDiagnostic, onAlert, onSyncComplete, onSnapshot]);

  useEffect(() => {
    unmountedRef.current = false;
    connect();
    return () => {
      unmountedRef.current = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { metrics, latestDiagnosticEpoch, latestSnapshotEpoch, wsConnected };
}
