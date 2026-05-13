import React, { useState } from "react";
import { useScenesInTier } from "../../hooks/useScenesInTier";
import { useTiers } from "../../hooks/useTiers";

interface TierListProps {
  selectedTier: string | null;
  selectedScene: string | null;
  onSelect: (tier: string, scene: string) => void;
}

export function TierList({ selectedTier, selectedScene, onSelect }: TierListProps) {
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
          onSelect={onSelect}
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
  onSelect,
}: {
  tierName: string;
  sceneCount: number;
  selectedTier: string | null;
  selectedScene: string | null;
  onSelect: (tier: string, scene: string) => void;
}) {
  const [expanded, setExpanded] = useState(selectedTier === tierName);
  const { scenes, loading } = useScenesInTier(expanded ? tierName : null);

  return (
    <div style={s.block}>
      <div style={s.tierRow} onClick={() => setExpanded((v) => !v)}>
        <span style={s.arrow}>{expanded ? "▾" : "▸"}</span>
        <span style={s.tierName}>{tierName}</span>
        <span style={s.muted}>({sceneCount})</span>
      </div>
      {expanded && (loading ? (
        <div style={{ ...s.muted, padding: "4px 28px" }}>Loading…</div>
      ) : (
        scenes.map((scene) => {
          const isSelected = selectedTier === tierName && selectedScene === scene;
          return (
            <div
              key={scene}
              onClick={() => onSelect(tierName, scene)}
              style={{
                ...s.sceneRow,
                background: isSelected ? "#3f3f3f" : "transparent",
                color: isSelected ? "#ececec" : "#8e8ea0",
              }}
            >
              {scene}
            </div>
          );
        })
      ))}
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
  sceneRow: {
    padding: "4px 6px 4px 28px",
    fontSize: 12,
    fontFamily: "ui-monospace, monospace",
    cursor: "pointer",
    borderRadius: 6,
  },
};
