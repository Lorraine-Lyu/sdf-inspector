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
              <span style={{ flex: 1 }}>{t.message}</span>
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
    case "info":    return { borderLeft: "3px solid #565869" };
    case "warning": return { borderLeft: "3px solid #f5a623" };
    case "error":   return { borderLeft: "3px solid #ef4444" };
    case "success": return { borderLeft: "3px solid #10a37f" };
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
    maxWidth: 340,
  },
  toast: {
    background: "#2f2f2f",
    color: "#ececec",
    padding: "10px 14px",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    fontSize: 13,
    animation: "slideIn 0.2s ease",
  },
  close: {
    background: "none",
    border: "none",
    color: "#565869",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
    flexShrink: 0,
  },
};
