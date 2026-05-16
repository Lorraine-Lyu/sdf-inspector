import React from "react";
import { SDFViewer } from "../SDFViewer";
import { GroundTruthPanel } from "./GroundTruthPanel";
import { useGroundTruthGlsl } from "../../hooks/useGroundTruthGlsl";
import { useSceneViewDetail } from "../../hooks/useSceneViewDetail";

const API_ORIGIN = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

interface SceneViewDetailProps {
  tier: string | null;
  scene: string | null;
}

export function SceneViewDetail({ tier, scene }: SceneViewDetailProps) {
  const { detail, loading: detailLoading, error: detailError } = useSceneViewDetail(tier, scene);
  const { glsl, loading: glslLoading, error: glslError } = useGroundTruthGlsl(tier, scene);

  if (!tier || !scene) {
    return <div style={s.empty}>Select a scene from the left</div>;
  }
  if (detailLoading) return <div style={s.muted}>Loading…</div>;
  if (detailError) return <div style={s.error}>{detailError}</div>;
  if (!detail) return null;

  return (
    <div className="scene-detail-layout">
      <div className="scene-content" style={s.root}>
        <div style={s.header}>
          <span style={s.title}>{detail.tier} / {detail.scene}</span>
          <span style={s.muted}>{detail.view_count} views</span>
        </div>

        <div style={s.imageGrid}>
          {detail.views.map((v) => {
            const fullUrl = v.image_url.startsWith("http")
              ? v.image_url
              : `${API_ORIGIN}${v.image_url}`;
            return (
              <div key={v.index} style={s.imageCell}>
                <img src={fullUrl} alt={`view ${v.index}`} style={s.image} />
                <span style={s.imageLabel}>v_{String(v.index).padStart(2, "0")}</span>
              </div>
            );
          })}
        </div>

        <div style={s.section}>
          <span style={s.sectionLabel}>Ground Truth</span>
          {glslLoading ? (
            <div style={s.muted}>Compiling GLSL…</div>
          ) : glslError ? (
            <div style={s.error}>{glslError}</div>
          ) : glsl ? (
            <SDFViewer expression={glsl} width={440} height={380} />
          ) : (
            <div style={s.muted}>No ground truth available</div>
          )}
        </div>
      </div>

      <div className="ground-truth-panel">
        <GroundTruthPanel groundTruth={detail.ground_truth} />
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { display: "flex", flexDirection: "column", gap: 16 },
  header: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
    paddingBottom: 8,
    borderBottom: "1px solid #3f3f3f",
  },
  title: { fontSize: 15, fontWeight: 600, color: "#ececec" },
  muted: { color: "#565869", fontSize: 13 },
  empty: { color: "#565869", fontSize: 13, padding: 24 },
  error: { color: "#ef4444", fontSize: 13 },
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 8,
  },
  imageCell: {
    background: "#212121",
    borderRadius: 8,
    padding: 6,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "auto",
    aspectRatio: "1",
    objectFit: "cover",
    borderRadius: 4,
    background: "#171717",
  },
  imageLabel: {
    fontSize: 10,
    color: "#8e8ea0",
    fontFamily: "ui-monospace, monospace",
  },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  sectionLabel: {
    fontSize: 11,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
};
