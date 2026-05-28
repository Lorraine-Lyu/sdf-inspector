import React from "react";
import { SDFViewer } from "../SDFViewer";
import { useSyncedCamera } from "../../hooks/useSyncedCamera";

interface PredictionRendererProps {
  predictedSdf: string | null;
  groundTruthSdf: string | null;
  width?: number;
  height?: number;
}

/** Stacked "Predicted" + "Ground Truth" SDFViewer pair with a shared camera.
 *  Used by the inference playground and reconstruction snapshots view. */
export function PredictionRenderer({
  predictedSdf,
  groundTruthSdf,
  width = 400,
  height = 320,
}: PredictionRendererProps) {
  const { cameraState, setCameraState } = useSyncedCamera();
  return (
    <div style={s.col}>
      <div style={s.label}>Predicted</div>
      {predictedSdf ? (
        <SDFViewer
          expression={predictedSdf}
          width={width}
          height={height}
          cameraState={cameraState}
          onCameraChange={setCameraState}
          materialColor={[0.4, 0.8, 0.65]}
        />
      ) : (
        <div style={{ ...s.placeholder, height }}>No prediction</div>
      )}
      <div style={s.label}>Ground Truth</div>
      {groundTruthSdf ? (
        <SDFViewer
          expression={groundTruthSdf}
          width={width}
          height={height}
          cameraState={cameraState}
          onCameraChange={setCameraState}
        />
      ) : (
        <div style={{ ...s.placeholder, height }}>Loading GT…</div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  col: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    fontSize: 11,
    color: "#8e8ea0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  placeholder: {
    background: "#212121",
    borderRadius: 8,
    color: "#565869",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
