import { useState } from "react";
import type { CameraState } from "../api/types";

const DEFAULT_CAMERA: CameraState = {
  position: [2, 1.5, 2],
  target: [0, 0, 0],
  zoom: 1,
};

export function useSyncedCamera(initialState?: CameraState) {
  const [cameraState, setCameraState] = useState<CameraState>(
    initialState ?? DEFAULT_CAMERA
  );
  return { cameraState, setCameraState };
}
