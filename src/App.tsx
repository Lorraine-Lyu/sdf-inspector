import { useCallback } from "react";
import type { AlertEvent } from "./api/types";
import { ToastProvider, useToast } from "./components/Toast";
import { useMetricsStream } from "./hooks/useMetricsStream";
import { useTrainingStatus } from "./hooks/useTrainingStatus";
import { Layout } from "./layout/Layout";
import { Dashboard } from "./pages/Dashboard";

function AppInner() {
  const { addToast } = useToast();

  const {
    status,
    refetch,
    applyStatusEvent,
    applyCurriculumEvent,
    applyMetricsUpdate,
  } = useTrainingStatus();

  const handleAlert = useCallback(
    (ev: AlertEvent) => {
      addToast(
        ev.message,
        ev.severity === "error" ? "error" : ev.severity === "warning" ? "warning" : "info"
      );
    },
    [addToast]
  );

  const { metrics, recentScenes, wsConnected } = useMetricsStream({
    runId: status?.run_id ?? null,
    onStatusEvent: applyStatusEvent,
    onCurriculumEvent: applyCurriculumEvent,
    onMetricsUpdate: applyMetricsUpdate,
    onAlert: handleAlert,
  });

  return (
    <Layout wsConnected={wsConnected}>
      <Dashboard
        status={status}
        metrics={metrics}
        recentScenes={recentScenes}
        refetch={refetch}
      />
    </Layout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
