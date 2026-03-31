import { useCallback } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import type { AlertEvent } from "./api/types";
import { ToastProvider, useToast } from "./components/Toast";
import { useMetricsStream } from "./hooks/useMetricsStream";
import { useTrainingStatus } from "./hooks/useTrainingStatus";
import { Layout } from "./layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { SceneDetailPage } from "./pages/SceneDetailPage";

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

  const handleStatusEvent = useCallback(
    (ev: Parameters<typeof applyStatusEvent>[0]) => {
      applyStatusEvent(ev);
      void refetch();
    },
    [applyStatusEvent, refetch]
  );

  const { metrics, recentScenes, wsConnected } = useMetricsStream({
    runId: status?.run_id ?? null,
    onStatusEvent: handleStatusEvent,
    onCurriculumEvent: applyCurriculumEvent,
    onMetricsUpdate: applyMetricsUpdate,
    onAlert: handleAlert,
  });

  return (
    <Layout wsConnected={wsConnected}>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              status={status}
              metrics={metrics}
              recentScenes={recentScenes}
              refetch={refetch}
            />
          }
        />
        <Route path="/scene/:sceneId" element={<SceneDetailPage />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </BrowserRouter>
  );
}
