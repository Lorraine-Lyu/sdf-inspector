import { useCallback } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import type { AlertEvent } from "./api/types";
import { ToastProvider, useToast } from "./components/Toast";
import { useMetricsStream } from "./hooks/useMetricsStream";
import { useTrainingStatus } from "./hooks/useTrainingStatus";
import { Layout } from "./layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Experiments } from "./pages/Experiments";
import { Playground } from "./pages/Playground";
import { SceneBrowser } from "./pages/SceneBrowser";

function AppInner() {
  const { addToast } = useToast();

  const { status, refetch, applyStatusEvent, applyMetricsUpdate } = useTrainingStatus();

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

  const { metrics, latestDiagnosticEpoch, wsConnected } = useMetricsStream({
    runId: status?.run_id ?? null,
    experimentId: status?.experiment_id ?? null,
    onStatusEvent: handleStatusEvent,
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
              latestDiagnosticEpoch={latestDiagnosticEpoch}
            />
          }
        />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="/scenes" element={<SceneBrowser />} />
        <Route path="/playground" element={<Playground />} />
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
