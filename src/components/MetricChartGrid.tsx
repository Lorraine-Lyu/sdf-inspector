import React, { useMemo } from "react";
import type { MetricsHistory } from "../api/types";
import { MetricChart, type MetricChartLine } from "./MetricChart";

interface MetricChartGridProps {
  metrics: MetricsHistory;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isLive?: boolean;
}

const TRAIN_COLOR = "#10a37f";
const VAL_COLOR = "#f5a623";
const SINGLE_COLOR = "#4f8ef7";

interface ChartSpec {
  title: string;
  lines: MetricChartLine[];
}

interface SectionSpec {
  name: string;
  charts: ChartSpec[];
  /** If true, hide whole section if every chart has only all-zero/empty data. */
  hideIfAllZero?: boolean;
}

const SECTIONS: SectionSpec[] = [
  {
    name: "Loss",
    charts: [
      {
        title: "Loss",
        lines: [
          { dataKey: "train_loss", label: "Train", color: TRAIN_COLOR },
          { dataKey: "val_loss", label: "Val", color: VAL_COLOR, dashed: true },
        ],
      },
    ],
  },
  {
    name: "Accuracy",
    charts: [
      {
        title: "Type Accuracy",
        lines: [
          { dataKey: "train_type_acc", label: "Train", color: TRAIN_COLOR },
          { dataKey: "val_type_acc", label: "Val", color: VAL_COLOR, dashed: true },
        ],
      },
      {
        title: "Existence Accuracy",
        lines: [
          { dataKey: "train_exist_acc", label: "Train", color: TRAIN_COLOR },
          { dataKey: "val_exist_acc", label: "Val", color: VAL_COLOR, dashed: true },
        ],
      },
    ],
  },
  {
    name: "Parameter Quality",
    charts: [
      {
        title: "Translation MAE",
        lines: [
          { dataKey: "train_trans_mae", label: "Train", color: TRAIN_COLOR },
          { dataKey: "val_trans_mae", label: "Val", color: VAL_COLOR, dashed: true },
        ],
      },
      {
        title: "Rotation Error (°)",
        lines: [
          { dataKey: "train_rot_err_deg", label: "Train", color: TRAIN_COLOR },
          { dataKey: "val_rot_err_deg", label: "Val", color: VAL_COLOR, dashed: true },
        ],
      },
      {
        title: "Param Loss",
        lines: [{ dataKey: "val_param_loss", label: "Val", color: VAL_COLOR, dashed: true }],
      },
    ],
  },
  {
    name: "Rounding",
    charts: [
      {
        title: "Rounding Loss",
        lines: [
          { dataKey: "train_rounding_loss", label: "Train", color: TRAIN_COLOR },
          { dataKey: "val_rounding_loss", label: "Val", color: VAL_COLOR, dashed: true },
        ],
      },
    ],
  },
  {
    name: "Poincaré Losses",
    hideIfAllZero: true,
    charts: [
      {
        title: "Poincaré Depth",
        lines: [
          { dataKey: "train_p_depth", label: "Train", color: TRAIN_COLOR },
          { dataKey: "val_p_depth", label: "Val", color: VAL_COLOR, dashed: true },
        ],
      },
      {
        title: "Poincaré Proximity",
        lines: [
          { dataKey: "train_p_prox", label: "Train", color: TRAIN_COLOR },
          { dataKey: "val_p_prox", label: "Val", color: VAL_COLOR, dashed: true },
        ],
      },
      {
        title: "Poincaré Op",
        lines: [
          { dataKey: "train_p_op", label: "Train", color: TRAIN_COLOR },
          { dataKey: "val_p_op", label: "Val", color: VAL_COLOR, dashed: true },
        ],
      },
      {
        title: "Poincaré K",
        lines: [
          { dataKey: "train_p_k", label: "Train", color: TRAIN_COLOR },
          { dataKey: "val_p_k", label: "Val", color: VAL_COLOR, dashed: true },
        ],
      },
    ],
  },
  {
    name: "Other",
    charts: [
      {
        title: "Learning Rate",
        lines: [{ dataKey: "lr", label: "LR", color: SINGLE_COLOR }],
      },
      {
        title: "Num Matched",
        lines: [{ dataKey: "val_num_matched", label: "Matched", color: SINGLE_COLOR }],
      },
      {
        title: "Epoch Duration (s)",
        lines: [{ dataKey: "elapsed_sec", label: "Seconds", color: SINGLE_COLOR }],
      },
    ],
  },
];

function isColAllZero(col: number[] | undefined): boolean {
  if (!col || col.length === 0) return true;
  return col.every((v) => v === 0 || v === null || v === undefined);
}

function chartHasData(chart: ChartSpec, metrics: MetricsHistory): boolean {
  return chart.lines.some((line) => !isColAllZero(metrics[line.dataKey] as number[] | undefined));
}

export function MetricChartGrid({ metrics }: MetricChartGridProps) {
  const data = useMemo(() => {
    return metrics.epochs.map((epoch, i) => {
      const row: Record<string, number | null> = { epoch };
      for (const section of SECTIONS) {
        for (const chart of section.charts) {
          for (const line of chart.lines) {
            const col = metrics[line.dataKey] as number[] | undefined;
            row[line.dataKey] = col?.[i] ?? null;
          }
        }
      }
      return row;
    });
  }, [metrics]);

  const empty = metrics.epochs.length === 0;

  if (empty) {
    return <div style={styles.empty}>Waiting for first epoch…</div>;
  }

  return (
    <div style={styles.grid}>
      {SECTIONS.map((section) => {
        const visibleCharts = section.charts.filter((chart) => chartHasData(chart, metrics));
        if (section.hideIfAllZero && visibleCharts.length === 0) return null;
        return (
          <React.Fragment key={section.name}>
            <div style={styles.sectionHeader}>{section.name}</div>
            {visibleCharts.map((chart) => (
              <MetricChart
                key={chart.title}
                title={chart.title}
                data={data}
                lines={chart.lines}
              />
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: 16,
    width: "100%",
  },
  sectionHeader: {
    gridColumn: "1 / -1",
    fontSize: 11,
    fontWeight: 600,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    paddingTop: 4,
    borderBottom: "1px solid #3f3f3f",
    paddingBottom: 6,
  },
  empty: {
    background: "#2f2f2f",
    borderRadius: 10,
    padding: 24,
    color: "#565869",
    fontSize: 13,
    textAlign: "center",
  },
};
