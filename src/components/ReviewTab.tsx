import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRunReview } from "../hooks/useRunReview";

interface ReviewTabProps {
  runId: string;
  experimentId?: string | null;
  active: boolean;
}

export function ReviewTab({ runId, experimentId = null, active }: ReviewTabProps) {
  const { content, loaded, loading, error } = useRunReview(runId, active, experimentId);

  if (loading && !loaded) return <div style={s.muted}>Loading review…</div>;
  if (error) return <div style={s.error}>{error}</div>;
  if (loaded && content === null) {
    return <div style={s.muted}>No review available for this run.</div>;
  }
  if (!content) return <div style={s.muted}>No review available for this run.</div>;

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  muted: { color: "#565869", fontSize: 13 },
  error: { color: "#ef4444", fontSize: 13 },
};
