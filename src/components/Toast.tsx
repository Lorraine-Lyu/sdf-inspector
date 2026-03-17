import React, { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";

export type ToastSeverity = "info" | "warning" | "error" | "success";

interface Toast {
  id: number;
  severity: ToastSeverity;
  message: string;
}

interface ToastContextValue {
  addToast: (message: string, severity?: ToastSeverity) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, severity: ToastSeverity = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, severity, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {createPortal(
        <div style={styles.container}>
          {toasts.map((t) => (
            <div key={t.id} style={{ ...styles.toast, ...severityStyle(t.severity) }}>
              <span>{t.message}</span>
              <button style={styles.close} onClick={() => dismiss(t.id)}>×</button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

function severityStyle(s: ToastSeverity): React.CSSProperties {
  switch (s) {
    case "info":    return { background: "#1d4ed8", borderLeft: "4px solid #3b82f6" };
    case "warning": return { background: "#92400e", borderLeft: "4px solid #f59e0b" };
    case "error":   return { background: "#991b1b", borderLeft: "4px solid #ef4444" };
    case "success": return { background: "#065f46", borderLeft: "4px solid #10b981" };
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    bottom: 24,
    right: 24,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    zIndex: 9999,
    maxWidth: 360,
  },
  toast: {
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    fontSize: 14,
    animation: "slideIn 0.2s ease",
  },
  close: {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: 18,
    lineHeight: 1,
    padding: 0,
    opacity: 0.8,
  },
};
