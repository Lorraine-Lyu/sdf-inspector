import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { CheckpointSelection } from "../components/playground/CheckpointPicker";
import { CheckpointPicker } from "../components/playground/CheckpointPicker";
import { SlotCard } from "../components/playground/SlotCard";
import { ViewSelector } from "../components/playground/ViewSelector";
import { SDFViewer } from "../components/SDFViewer";
import { TagFilteredScenePicker } from "../components/scenes/TagFilteredScenePicker";
import { useGroundTruthGlsl } from "../hooks/useGroundTruthGlsl";
import { useInference } from "../hooks/useInference";
import { useSceneViewDetail } from "../hooks/useSceneViewDetail";
import { useSyncedCamera } from "../hooks/useSyncedCamera";

export function Playground() {
  const [searchParams] = useSearchParams();
  const [checkpoint, setCheckpoint] = useState<CheckpointSelection | null>(() => {
    const runId = searchParams.get("run");
    const ckpt = searchParams.get("checkpoint");
    const exp = searchParams.get("experiment");
    if (runId && ckpt) return { experimentId: exp ?? "", runId, checkpointId: ckpt };
    return null;
  });

  const [scene, setScene] = useState<{ tier: string; scene: string } | null>(null);
  const { detail: sceneDetail } = useSceneViewDetail(
    scene?.tier ?? null,
    scene?.scene ?? null
  );
  const { glsl: gtGlsl } = useGroundTruthGlsl(scene?.tier ?? null, scene?.scene ?? null);

  const [selectedViews, setSelectedViews] = useState<number[]>([]);
  const { predict, result, loading, error } = useInference();

  // Sync the two SDFViewers' cameras.
  const { cameraState, setCameraState } = useSyncedCamera();

  // When the scene changes, default to all views.
  useEffect(() => {
    if (sceneDetail) setSelectedViews(sceneDetail.views.map((v) => v.index));
    else setSelectedViews([]);
  }, [sceneDetail]);

  const canPredict = useMemo(
    () => Boolean(checkpoint && scene && selectedViews.length > 0 && !loading),
    [checkpoint, scene, selectedViews, loading]
  );

  const handlePredict = () => {
    if (!checkpoint || !scene) return;
    void predict({
      run_id: checkpoint.runId,
      ...(checkpoint.experimentId
        ? { experiment_id: checkpoint.experimentId }
        : {}),
      checkpoint_id: checkpoint.checkpointId,
      scene_path: `${scene.tier}/${scene.scene}`,
      view_indices: selectedViews,
    }).catch(() => {
      // error already captured in the hook
    });
  };

  const sortedSlots = useMemo(() => {
    if (!result) return [];
    return [...result.slots].sort((a, b) => b.existence - a.existence);
  }, [result]);

  return (
    <div style={s.page}>
      {/* Input panel */}
      <div style={s.left}>
        <Section title="Checkpoint">
          <CheckpointPicker selection={checkpoint} onSelect={setCheckpoint} />
        </Section>
        <Section title="Scene">
          <TagFilteredScenePicker
            selectedTier={scene?.tier}
            selectedScene={scene?.scene}
            onSceneSelect={(tier, sceneName) => setScene({ tier, scene: sceneName })}
          />
        </Section>
        {sceneDetail && (
          <Section title="Views">
            <ViewSelector
              views={sceneDetail.views}
              selected={selectedViews}
              onChange={setSelectedViews}
            />
          </Section>
        )}
        <button
          style={{
            ...s.predictBtn,
            opacity: canPredict ? 1 : 0.5,
            cursor: canPredict ? "pointer" : "not-allowed",
          }}
          disabled={!canPredict}
          onClick={handlePredict}
        >
          {loading ? "Predicting…" : "Predict"}
        </button>
        {error && <div style={s.error}>{error}</div>}
      </div>

      {/* Raw prediction panel */}
      <div style={s.middle}>
        <div style={s.sectionTitle}>Slots</div>
        {!result ? (
          <div style={s.muted}>Run a prediction to see slot outputs</div>
        ) : (
          <div style={s.slotList}>
            {sortedSlots.map((slot) => (
              <SlotCard key={slot.slot_index} slot={slot} />
            ))}
          </div>
        )}
        {result?.metadata && Object.keys(result.metadata).length > 0 && (
          <div style={s.metaCard}>
            <div style={s.sectionTitle}>Metadata</div>
            <pre style={s.pre}>{JSON.stringify(result.metadata, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Rendered panel */}
      <div style={s.right}>
        <div style={s.sectionTitle}>Predicted</div>
        {result?.predicted_sdf ? (
          <SDFViewer
            expression={result.predicted_sdf}
            width={400}
            height={340}
            cameraState={cameraState}
            onCameraChange={setCameraState}
            materialColor={[0.4, 0.8, 0.65]}
          />
        ) : (
          <div style={{ ...s.muted, height: 340 }}>—</div>
        )}
        <div style={s.sectionTitle}>Ground Truth</div>
        {gtGlsl ? (
          <SDFViewer
            expression={gtGlsl}
            width={400}
            height={340}
            cameraState={cameraState}
            onCameraChange={setCameraState}
          />
        ) : (
          <div style={{ ...s.muted, height: 340 }}>Select a scene to see GT</div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={s.section}>
      <div style={s.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    display: "grid",
    gridTemplateColumns: "320px 1fr 420px",
    gap: 16,
    minHeight: "calc(100vh - 56px)",
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    overflowY: "auto",
    paddingRight: 8,
    borderRight: "1px solid #3f3f3f",
  },
  middle: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflowY: "auto",
  },
  right: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingLeft: 16,
    borderLeft: "1px solid #3f3f3f",
  },
  section: { display: "flex", flexDirection: "column", gap: 6 },
  sectionTitle: {
    fontSize: 11,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  predictBtn: {
    background: "#10a37f",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    marginTop: 4,
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
    background: "#ef44441a",
    border: "1px solid #ef444466",
    padding: "8px 12px",
    borderRadius: 6,
  },
  muted: {
    color: "#565869",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  slotList: { display: "flex", flexDirection: "column", gap: 6 },
  metaCard: {
    background: "#2f2f2f",
    borderRadius: 8,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  pre: {
    background: "#212121",
    borderRadius: 4,
    padding: "8px 12px",
    fontSize: 11,
    color: "#ececec",
    margin: 0,
    overflowX: "auto",
  },
};
