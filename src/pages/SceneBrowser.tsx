import React, { useState } from "react";
import { TierList } from "../components/scenes/TierList";
import { SceneViewDetail } from "../components/scenes/SceneViewDetail";

export function SceneBrowser() {
  const [selected, setSelected] = useState<{ tier: string; scene: string } | null>(null);

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.sectionLabel}>Tiers</div>
        <div style={s.scroll}>
          <TierList
            selectedTier={selected?.tier ?? null}
            selectedScene={selected?.scene ?? null}
            onSelect={(tier, scene) => setSelected({ tier, scene })}
          />
        </div>
      </div>
      <div style={s.right}>
        <SceneViewDetail tier={selected?.tier ?? null} scene={selected?.scene ?? null} />
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    gap: 0,
    height: "100%",
    minHeight: "calc(100vh - 56px)",
  },
  left: {
    width: 280,
    minWidth: 280,
    borderRight: "1px solid #3f3f3f",
    display: "flex",
    flexDirection: "column",
    paddingRight: 0,
  },
  sectionLabel: {
    fontSize: 11,
    color: "#565869",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    paddingBottom: 12,
  },
  scroll: { flex: 1, overflowY: "auto" },
  right: { flex: 1, paddingLeft: 24, overflowY: "auto" },
};
