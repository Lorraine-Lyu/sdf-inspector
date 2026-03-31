import React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { SceneDetail } from "../components/SceneDetail";

export function SceneDetailPage() {
  const { sceneId } = useParams<{ sceneId: string }>();
  const [searchParams] = useSearchParams();
  const runId = searchParams.get("runId");
  const checkpointId = searchParams.get("checkpointId");

  if (!sceneId) return null;

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.back}>← Back to Dashboard</Link>
      <SceneDetail sceneId={sceneId} runId={runId} checkpointId={checkpointId} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    padding: "28px 32px",
  },
  back: {
    fontSize: 13,
    color: "#8e8ea0",
    textDecoration: "none",
    alignSelf: "flex-start",
  },
};
