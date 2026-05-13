import React, { useEffect, useMemo, useState } from "react";
import { useSlotDiagnostic } from "../../hooks/useSlotDiagnostic";
import { useSlotDiagnosticList } from "../../hooks/useSlotDiagnosticList";
import { CosineMatrix } from "./CosineMatrix";
import { InterpretationBadges } from "./InterpretationBadges";
import { SlotExistenceTable } from "./SlotExistenceTable";
import { TypeHeatmap } from "./TypeHeatmap";

interface SlotDiagnosticsTabProps {
  runId: string;
}

const ALL_TIERS = "__all__";

export function SlotDiagnosticsTab({ runId }: SlotDiagnosticsTabProps) {
  const { list, loading: listLoading } = useSlotDiagnosticList(runId);
  const [epoch, setEpoch] = useState<number | null>(null);
  const [tierFilter, setTierFilter] = useState<string>(ALL_TIERS);

  // Default to the latest epoch when the list loads.
  useEffect(() => {
    if (list.length > 0 && epoch === null) {
      setEpoch(list[list.length - 1].epoch);
    }
  }, [list, epoch]);

  const { diagnostic, loading } = useSlotDiagnostic(runId, epoch);

  const tierOptions = useMemo(() => {
    const tiers = (diagnostic?.per_tier ?? []).map((t) => t.tier_filter);
    return [ALL_TIERS, ...tiers];
  }, [diagnostic]);

  // Reset tier filter when switching epochs (per_tier list may differ).
  useEffect(() => {
    setTierFilter(ALL_TIERS);
  }, [epoch]);

  // Pick which slot list and cosine matrix to display.
  const view = useMemo(() => {
    if (!diagnostic) return null;
    if (tierFilter === ALL_TIERS) {
      return {
        slots: diagnostic.slots,
        cosine: diagnostic.cosine_similarity,
        interpretation: diagnostic.interpretation,
        num_scenes: diagnostic.num_scenes,
        tier_filter: diagnostic.tier_filter,
      };
    }
    const tier = diagnostic.per_tier?.find((t) => t.tier_filter === tierFilter);
    if (!tier) return null;
    return {
      slots: tier.slots,
      cosine: diagnostic.cosine_similarity,
      interpretation: diagnostic.interpretation,
      num_scenes: tier.num_scenes,
      tier_filter: tier.tier_filter,
    };
  }, [diagnostic, tierFilter]);

  if (listLoading) return <div style={s.muted}>Loading…</div>;
  if (list.length === 0) {
    return (
      <div style={s.muted}>
        No slot diagnostics yet — they're written every 10 epochs by the training script.
      </div>
    );
  }

  return (
    <div style={s.root}>
      <div style={s.controls}>
        <label style={s.label}>Epoch</label>
        <select
          style={s.select}
          value={epoch ?? ""}
          onChange={(e) => setEpoch(parseInt(e.target.value, 10))}
        >
          {list.map((item) => (
            <option key={item.epoch} value={item.epoch}>
              {item.epoch}
            </option>
          ))}
        </select>
        {tierOptions.length > 1 && (
          <>
            <label style={s.label}>Tier</label>
            <select
              style={s.select}
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
            >
              {tierOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === ALL_TIERS ? "All tiers" : opt}
                </option>
              ))}
            </select>
          </>
        )}
        {view && (
          <span style={s.muted}>
            {view.num_scenes} scenes · filter: {view.tier_filter || "all"}
          </span>
        )}
      </div>

      {loading || !diagnostic || !view ? (
        <div style={s.muted}>Loading diagnostic…</div>
      ) : (
        <>
          <Section title="Interpretation">
            <InterpretationBadges interpretation={view.interpretation} />
          </Section>

          <Section title="Slot existence">
            <SlotExistenceTable slots={view.slots} />
          </Section>

          <Section title="Type histogram">
            <TypeHeatmap slots={view.slots} />
          </Section>

          <Section title="Token cosine similarity (K × K)">
            <CosineMatrix matrix={view.cosine} />
          </Section>
        </>
      )}
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
  root: { display: "flex", flexDirection: "column", gap: 18 },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    background: "#212121",
    borderRadius: 8,
    flexWrap: "wrap",
  },
  label: { fontSize: 12, color: "#8e8ea0" },
  select: {
    background: "#171717",
    border: "1px solid #3f3f3f",
    borderRadius: 6,
    color: "#ececec",
    padding: "4px 8px",
    fontSize: 12,
    outline: "none",
  },
  muted: { color: "#565869", fontSize: 13 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  sectionTitle: {
    fontSize: 11,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
};
