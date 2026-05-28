import React, { useEffect, useMemo, useState } from "react";
import { PredictionRenderer } from "../playground/PredictionRenderer";
import { RawPredictionPanel } from "../playground/RawPredictionPanel";
import { SlotCard } from "../playground/SlotCard";
import { ViewSelector } from "../playground/ViewSelector";
import { useGroundTruthGlsl } from "../../hooks/useGroundTruthGlsl";
import { useSceneViewDetail } from "../../hooks/useSceneViewDetail";
import { useSnapshotDetail } from "../../hooks/useSnapshotDetail";
import { useSnapshots } from "../../hooks/useSnapshots";
import type { SnapshotScene } from "../../api/types";

interface ReconstructionSnapshotsProps {
  runId: string | null;
  experimentId: string | null;
  /** Latest epoch reported via WS or initial list. Used to auto-switch the
   *  view to the newest snapshot when training writes one. */
  latestEpoch: number | null;
}

export function ReconstructionSnapshots({
  runId,
  experimentId,
  latestEpoch,
}: ReconstructionSnapshotsProps) {
  // Bump on `latestEpoch` change to force the listing to refetch — picks up
  // the newly-written epoch_NNN directory.
  const { list, loading: listLoading } = useSnapshots(
    runId,
    experimentId,
    latestEpoch ?? 0
  );

  const [selectedEpoch, setSelectedEpoch] = useState<number | null>(null);

  // Default-select the latest epoch as the list arrives or updates.
  useEffect(() => {
    if (list.length === 0) {
      setSelectedEpoch(null);
      return;
    }
    const latest = list[list.length - 1].epoch;
    setSelectedEpoch((prev) => {
      // Auto-advance ONLY if the user was on the previously-latest entry —
      // otherwise leave their selection alone so they can browse history
      // without getting yanked forward by live training.
      if (prev === null) return latest;
      const prevWasLatest =
        list.length >= 2 && prev === list[list.length - 2].epoch;
      return prevWasLatest ? latest : prev;
    });
  }, [list]);

  const { detail, loading: detailLoading } = useSnapshotDetail(
    runId,
    selectedEpoch,
    experimentId
  );

  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  // Pick the first scene by default whenever a new epoch loads.
  useEffect(() => {
    if (!detail || detail.scenes.length === 0) {
      setSelectedSceneId(null);
      return;
    }
    setSelectedSceneId((prev) => {
      const stillPresent = prev && detail.scenes.some((s) => sceneId(s) === prev);
      return stillPresent ? prev : sceneId(detail.scenes[0]);
    });
  }, [detail]);

  const selectedScene = useMemo(
    () => detail?.scenes.find((s) => sceneId(s) === selectedSceneId) ?? null,
    [detail, selectedSceneId]
  );

  if (!runId || !experimentId) {
    return null;
  }

  if (listLoading && list.length === 0) {
    return <Section title="Reconstruction Snapshots">{<div style={s.muted}>Loading…</div>}</Section>;
  }

  if (list.length === 0) {
    return (
      <Section title="Reconstruction Snapshots">
        <div style={s.muted}>
          No snapshots yet — written every 10 epochs by the training script.
        </div>
      </Section>
    );
  }

  return (
    <Section title="Reconstruction Snapshots">
      <EpochNav
        list={list}
        selectedEpoch={selectedEpoch}
        onSelect={setSelectedEpoch}
      />
      {detailLoading ? (
        <div style={s.muted}>Loading snapshot…</div>
      ) : detail ? (
        <>
          <SceneTabs
            scenes={detail.scenes}
            selectedSceneId={selectedSceneId}
            onSelect={setSelectedSceneId}
          />
          {selectedScene ? (
            <ScenePanels scene={selectedScene} />
          ) : (
            <div style={s.muted}>No scenes in this snapshot.</div>
          )}
        </>
      ) : null}
    </Section>
  );
}

// ─── Layout helpers ─────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={s.section}>
      <div style={s.sectionHeader}>{title}</div>
      {children}
    </div>
  );
}

function EpochNav({
  list,
  selectedEpoch,
  onSelect,
}: {
  list: { epoch: number; num_scenes: number }[];
  selectedEpoch: number | null;
  onSelect: (epoch: number) => void;
}) {
  const idx = list.findIndex((e) => e.epoch === selectedEpoch);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  const current = idx >= 0 ? list[idx] : null;
  return (
    <div style={s.epochNav}>
      <button
        style={{ ...s.navBtn, opacity: prev ? 1 : 0.3 }}
        disabled={!prev}
        onClick={() => prev && onSelect(prev.epoch)}
      >
        ← {prev ? `Epoch ${prev.epoch}` : ""}
      </button>
      <span style={s.epochLabel}>
        {current ? `Epoch ${current.epoch}` : "—"}
        {current && (
          <span style={s.epochMeta}> · {current.num_scenes} scenes</span>
        )}
      </span>
      <button
        style={{ ...s.navBtn, opacity: next ? 1 : 0.3 }}
        disabled={!next}
        onClick={() => next && onSelect(next.epoch)}
      >
        {next ? `Epoch ${next.epoch}` : ""} →
      </button>
    </div>
  );
}

function SceneTabs({
  scenes,
  selectedSceneId,
  onSelect,
}: {
  scenes: SnapshotScene[];
  selectedSceneId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={s.sceneTabs}>
      {scenes.map((sc) => {
        const id = sceneId(sc);
        const active = id === selectedSceneId;
        return (
          <button
            key={id}
            style={{
              ...s.sceneChip,
              ...(active ? s.sceneChipActive : {}),
            }}
            onClick={() => onSelect(id)}
          >
            {id}
          </button>
        );
      })}
    </div>
  );
}

// ─── Three-panel view for the selected scene ────────────────────────────────

function ScenePanels({ scene }: { scene: SnapshotScene }) {
  // scene_path is "tier_XX/scene_tX_NNNNN"; split for the existing scene-view APIs.
  const [tier, sceneName] = useMemo(() => splitScenePath(scene.scene_path), [scene.scene_path]);
  const { detail: sceneDetail } = useSceneViewDetail(tier, sceneName);
  const { glsl: gtGlsl } = useGroundTruthGlsl(tier, sceneName);

  const sortedSlots = useMemo(
    () => [...scene.slots].sort((a, b) => b.existence - a.existence),
    [scene.slots]
  );

  return (
    <div style={s.threePanel}>
      <div style={s.leftPanel}>
        <div style={s.panelLabel}>Input Views</div>
        {sceneDetail ? (
          <ViewSelector
            views={sceneDetail.views}
            selected={scene.view_indices}
            onChange={() => {}}
            displayOnly
          />
        ) : (
          <div style={s.muted}>Loading views…</div>
        )}
      </div>

      <div style={s.middlePanel}>
        <div style={s.panelLabel}>Raw Predictions</div>
        <RawPredictionPanel rawPredictions={scene.raw_predictions} />
        <div style={{ ...s.panelLabel, marginTop: 8 }}>Slots</div>
        <div style={s.slotList}>
          {sortedSlots.map((slot) => (
            <SlotCard key={slot.slot_index} slot={slot} />
          ))}
        </div>
      </div>

      <div style={s.rightPanel}>
        <PredictionRenderer
          predictedSdf={scene.predicted_sdf}
          groundTruthSdf={gtGlsl ?? null}
        />
      </div>
    </div>
  );
}

// ─── Utilities ──────────────────────────────────────────────────────────────

function sceneId(scene: SnapshotScene): string {
  // scene_path looks like "tier_00/scene_t0_00042"; the scene_id is the basename.
  const parts = scene.scene_path.split("/");
  return parts[parts.length - 1];
}

function splitScenePath(path: string): [string | null, string | null] {
  const parts = path.split("/");
  if (parts.length < 2) return [null, null];
  return [parts[0], parts[parts.length - 1]];
}

const s: Record<string, React.CSSProperties> = {
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
    borderTop: "1px solid #3f3f3f",
  },
  sectionHeader: {
    fontSize: 11,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 600,
  },
  muted: { color: "#565869", fontSize: 13, padding: "8px 0" },
  epochNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    background: "#212121",
    borderRadius: 8,
    padding: "8px 12px",
  },
  navBtn: {
    fontSize: 12,
    padding: "4px 10px",
    background: "transparent",
    border: "1px solid #3f3f3f",
    borderRadius: 6,
    color: "#ececec",
    cursor: "pointer",
  },
  epochLabel: {
    fontSize: 13,
    color: "#ececec",
    fontWeight: 500,
  },
  epochMeta: { color: "#8e8ea0", fontWeight: 400 },
  sceneTabs: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  sceneChip: {
    fontSize: 11,
    padding: "4px 10px",
    background: "#212121",
    border: "1px solid #3f3f3f",
    borderRadius: 999,
    color: "#8e8ea0",
    cursor: "pointer",
    fontFamily: "ui-monospace, monospace",
  },
  sceneChipActive: {
    background: "#10a37f",
    borderColor: "#10a37f",
    color: "#fff",
  },
  threePanel: {
    display: "grid",
    gridTemplateColumns: "minmax(180px, 220px) minmax(0, 1fr) minmax(380px, 430px)",
    gap: 16,
    alignItems: "start",
  },
  leftPanel: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0 },
  middlePanel: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0 },
  rightPanel: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0 },
  panelLabel: {
    fontSize: 11,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  slotList: { display: "flex", flexDirection: "column", gap: 6 },
};
