const WS_URL =
  (import.meta.env.VITE_API_URL?.replace(/^http/, "ws") ?? "ws://localhost:8000") +
  "/ws/training";

export { WS_URL };
