import React, { useEffect, useState } from "react";
import { useScenesInTier } from "../../hooks/useScenesInTier";
import { useTierTags } from "../../hooks/useTierTags";
import { useTiers } from "../../hooks/useTiers";

const PAGE_SIZE = 50;

interface TagFilteredScenePickerProps {
  onSceneSelect: (tier: string, scene: string) => void;
  selectedTier?: string;
  selectedScene?: string;
}

export function TagFilteredScenePicker({
  onSceneSelect,
  selectedTier,
  selectedScene,
}: TagFilteredScenePickerProps) {
  const { tiers, loading } = useTiers();

  if (loading) return <div style={s.muted}>Loading tiers…</div>;
  if (tiers.length === 0)
    return <div style={s.muted}>No tiers found in scene_views/</div>;

  return (
    <div>
      {tiers.map((t) => (
        <TierBlock
          key={t.name}
          tierName={t.name}
          sceneCount={t.scene_count}
          selectedTier={selectedTier}
          selectedScene={selectedScene}
          onSceneSelect={onSceneSelect}
        />
      ))}
    </div>
  );
}

function TierBlock({
  tierName,
  sceneCount,
  selectedTier,
  selectedScene,
  onSceneSelect,
}: {
  tierName: string;
  sceneCount: number;
  selectedTier?: string;
  selectedScene?: string;
  onSceneSelect: (tier: string, scene: string) => void;
}) {
  const [expanded, setExpanded] = useState(selectedTier === tierName);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Bumped whenever the user commits a filter ("Load scenes"); also used as
  // the key for TierScenes so its pagination state resets on each new query.
  const [queryNonce, setQueryNonce] = useState<number | null>(null);

  const { tags, loading: tagsLoading } = useTierTags(expanded ? tierName : null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  };

  return (
    <div style={s.block}>
      <div style={s.tierRow} onClick={() => setExpanded((v) => !v)}>
        <span style={s.arrow}>{expanded ? "▾" : "▸"}</span>
        <span style={s.tierName}>{tierName}</span>
        <span style={s.muted}>({sceneCount})</span>
      </div>

      {expanded && (
        <div style={s.body}>
          {tagsLoading ? (
            <div style={{ ...s.muted, padding: "4px 0" }}>Loading tags…</div>
          ) : (
            <>
              {tags.length > 0 && (
                <div style={s.chips}>
                  {tags.map((t) => {
                    const active = selectedTags.includes(t.tag);
                    return (
                      <button
                        key={t.tag}
                        onClick={() => toggleTag(t.tag)}
                        style={{
                          ...s.chip,
                          ...(active ? s.chipActive : {}),
                        }}
                      >
                        {active ? "✓ " : ""}
                        {t.tag} ({t.count})
                      </button>
                    );
                  })}
                </div>
              )}
              <div style={s.controlRow}>
                <span style={s.muted}>
                  {selectedTags.length > 0
                    ? `Filter: ${selectedTags.join(" + ")}`
                    : "No tag filter"}
                </span>
                <button
                  style={s.loadBtn}
                  onClick={() => setQueryNonce((n) => (n ?? 0) + 1)}
                >
                  Load scenes
                </button>
              </div>

              {queryNonce !== null && (
                <TierScenes
                  key={queryNonce}
                  tier={tierName}
                  tags={selectedTags}
                  selectedTier={selectedTier}
                  selectedScene={selectedScene}
                  onSceneSelect={onSceneSelect}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TierScenes({
  tier,
  tags,
  selectedTier,
  selectedScene,
  onSceneSelect,
}: {
  tier: string;
  tags: string[];
  selectedTier?: string;
  selectedScene?: string;
  onSceneSelect: (tier: string, scene: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [accumulated, setAccumulated] = useState<string[]>([]);
  const { scenes, total, loading, error } = useScenesInTier(
    tier,
    tags,
    PAGE_SIZE,
    offset
  );

  useEffect(() => {
    if (offset === 0) {
      setAccumulated(scenes);
    } else if (scenes.length > 0) {
      setAccumulated((prev) => {
        const seen = new Set(prev);
        return [...prev, ...scenes.filter((sc) => !seen.has(sc))];
      });
    }
  }, [scenes, offset]);

  const hasMore = accumulated.length < total;

  if (error) return <div style={s.error}>{error}</div>;

  return (
    <div style={s.sceneList}>
      <div style={s.muted}>
        {loading && accumulated.length === 0
          ? "Loading scenes…"
          : `${total} matching scene${total === 1 ? "" : "s"}`}
      </div>
      {accumulated.map((scene) => {
        const isSelected =
          selectedTier === tier && selectedScene === scene;
        return (
          <div
            key={scene}
            onClick={() => onSceneSelect(tier, scene)}
            style={{
              ...s.sceneRow,
              background: isSelected ? "#3f3f3f" : "transparent",
              color: isSelected ? "#ececec" : "#8e8ea0",
            }}
          >
            {scene}
          </div>
        );
      })}
      {hasMore && (
        <button
          style={s.moreBtn}
          disabled={loading}
          onClick={() => setOffset((o) => o + PAGE_SIZE)}
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  muted: { color: "#565869", fontSize: 12 },
  block: { marginBottom: 4 },
  tierRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 6px",
    cursor: "pointer",
    borderRadius: 6,
    userSelect: "none",
  },
  arrow: { fontSize: 10, color: "#565869", width: 12 },
  tierName: { fontSize: 13, fontWeight: 500, color: "#ececec" },
  body: { padding: "4px 6px 8px 28px", display: "flex", flexDirection: "column", gap: 8 },
  chips: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: {
    fontSize: 11,
    padding: "3px 8px",
    background: "transparent",
    border: "1px solid #3f3f3f",
    borderRadius: 12,
    color: "#8e8ea0",
    cursor: "pointer",
  },
  chipActive: {
    background: "#10a37f",
    borderColor: "#10a37f",
    color: "#fff",
  },
  controlRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  loadBtn: {
    fontSize: 11,
    padding: "4px 10px",
    background: "#3f3f3f",
    border: "none",
    borderRadius: 6,
    color: "#ececec",
    cursor: "pointer",
  },
  sceneList: { display: "flex", flexDirection: "column", gap: 2 },
  sceneRow: {
    padding: "4px 6px",
    fontSize: 12,
    fontFamily: "ui-monospace, monospace",
    cursor: "pointer",
    borderRadius: 6,
  },
  moreBtn: {
    marginTop: 4,
    fontSize: 11,
    padding: "5px 10px",
    background: "transparent",
    border: "1px solid #3f3f3f",
    borderRadius: 6,
    color: "#8e8ea0",
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
    padding: "4px 0",
  },
};
