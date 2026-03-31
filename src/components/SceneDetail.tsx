import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import type { CheckpointMeta } from "../api/types";
import { ComparisonStrip } from "./ComparisonStrip";
import { SDFViewer } from "./SDFViewer";
import { useReconstruction } from "../hooks/useReconstruction";
import { useScene } from "../hooks/useScene";
import { useSyncedCamera } from "../hooks/useSyncedCamera";

interface SceneDetailProps {
  sceneId: string;
  runId?: string | null;
  checkpointId?: string | null;
}

export function SceneDetail({ sceneId, runId, checkpointId: initialCheckpointId }: SceneDetailProps) {
  const { scene, loading: sceneLoading, error: sceneError } = useScene(sceneId);
  const [checkpoints, setCheckpoints] = useState<CheckpointMeta[]>([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string | undefined>(
    initialCheckpointId ?? undefined
  );
  const [showGtExpression, setShowGtExpression] = useState(false);
  const [showPredExpression, setShowPredExpression] = useState(false);
  const { cameraState, setCameraState } = useSyncedCamera();

  const { reconstruction, loading: reconLoading } = useReconstruction(
    sceneId,
    runId ?? null,
    selectedCheckpoint
  );

  useEffect(() => {
    if (!runId) return;
    api.listCheckpoints(runId).then((ckpts) => {
      setCheckpoints(ckpts);
      if (!initialCheckpointId && ckpts.length > 0) {
        setSelectedCheckpoint(ckpts[ckpts.length - 1].id);
      }
    }).catch(() => {});
  }, [runId, initialCheckpointId]);

  if (sceneLoading) {
    return <div style={styles.loading}>Loading scene…</div>;
  }
  if (sceneError || !scene) {
    return <div style={styles.error}>{sceneError ?? "Scene not found"}</div>;
  }

  return (
    <div style={styles.root}>
      <div style={styles.viewports}>
        {/* Ground truth */}
        <div style={styles.panel}>
          <div style={styles.panelLabel}>Ground Truth</div>
          <SDFViewer
            expression={scene.ground_truth_sdf}
            width={440}
            height={380}
            cameraState={cameraState}
            onCameraChange={setCameraState}
          />
          <button
            style={styles.toggleBtn}
            onClick={() => setShowGtExpression((v) => !v)}
          >
            {showGtExpression ? "Hide GLSL" : "Show GLSL"}
          </button>
          {showGtExpression && (
            <pre style={styles.expressionBox}>{scene.ground_truth_sdf}</pre>
          )}
        </div>

        {/* Prediction */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelLabel}>Prediction</span>
            {runId && checkpoints.length > 0 && (
              <select
                style={styles.select}
                value={selectedCheckpoint ?? ""}
                onChange={(e) => setSelectedCheckpoint(e.target.value)}
              >
                {checkpoints.map((c) => (
                  <option key={c.id} value={c.id}>
                    Epoch {c.epoch} — {c.id}
                  </option>
                ))}
              </select>
            )}
          </div>

          {!runId ? (
            <div style={styles.placeholder}>Select a run to compare</div>
          ) : reconLoading ? (
            <div style={styles.placeholder}>Loading…</div>
          ) : reconstruction ? (
            <>
              <SDFViewer
                expression={reconstruction.predicted_sdf}
                width={440}
                height={380}
                cameraState={cameraState}
                onCameraChange={setCameraState}
                materialColor={[0.4, 0.8, 0.65]}
              />
              <button
                style={styles.toggleBtn}
                onClick={() => setShowPredExpression((v) => !v)}
              >
                {showPredExpression ? "Hide GLSL" : "Show GLSL"}
              </button>
              {showPredExpression && (
                <pre style={styles.expressionBox}>{reconstruction.predicted_sdf}</pre>
              )}
            </>
          ) : (
            <div style={styles.placeholder}>Not yet evaluated</div>
          )}
        </div>
      </div>

      <ComparisonStrip metrics={reconstruction?.metrics ?? null} />

      <div style={styles.meta}>
        <span style={styles.metaItem}>Scene: <b>{scene.id}</b></span>
        <span style={styles.metaItem}>Split: {scene.split}</span>
        <span style={styles.metaItem}>Tier {scene.complexity.tier}</span>
        <span style={styles.metaItem}>{scene.complexity.primitive_count} primitives</span>
        {scene.tags.map((t) => (
          <span key={t} style={styles.tag}>{t}</span>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  viewports: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  panelLabel: {
    fontSize: 11,
    color: "#8e8ea0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  placeholder: {
    width: 440,
    height: 380,
    background: "#2f2f2f",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#565869",
    fontSize: 13,
  },
  select: {
    background: "#212121",
    border: "1px solid #3f3f3f",
    borderRadius: 6,
    color: "#ececec",
    padding: "4px 8px",
    fontSize: 12,
    outline: "none",
  },
  toggleBtn: {
    alignSelf: "flex-start",
    background: "transparent",
    border: "1px solid #3f3f3f",
    borderRadius: 6,
    color: "#8e8ea0",
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
  },
  expressionBox: {
    background: "#212121",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 11,
    color: "#10a37f",
    fontFamily: "ui-monospace, monospace",
    overflowX: "auto",
    maxHeight: 200,
    overflowY: "auto",
    margin: 0,
  },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
    alignItems: "center",
  },
  metaItem: {
    fontSize: 12,
    color: "#8e8ea0",
  },
  tag: {
    fontSize: 11,
    background: "#3f3f3f",
    borderRadius: 4,
    padding: "2px 8px",
    color: "#8e8ea0",
  },
  loading: {
    color: "#565869",
    fontSize: 13,
    padding: 24,
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    padding: 24,
  },
};
