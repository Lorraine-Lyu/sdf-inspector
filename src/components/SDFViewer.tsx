import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { CameraState } from "../api/types";
import { buildFragmentShader, VERTEX_SHADER } from "./SDFViewerShader";

export interface SDFViewerProps {
  expression: string;
  width?: number;
  height?: number;
  cameraState?: CameraState;
  onCameraChange?: (state: CameraState) => void;
  backgroundColor?: string;
  materialColor?: [number, number, number];
}

export function SDFViewer({
  expression,
  width = 400,
  height = 400,
  cameraState,
  onCameraChange,
  materialColor = [0.7, 0.7, 0.7],
}: SDFViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [shaderError, setShaderError] = useState<string | null>(null);

  // Refs to hold Three.js objects across renders
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number>(0);
  const isExternalUpdateRef = useRef(false);

  // Setup scene once
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 100);
    camera.position.set(2, 1.5, 2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controlsRef.current = controls;

    controls.addEventListener("change", () => {
      if (isExternalUpdateRef.current) return;
      onCameraChange?.({
        position: camera.position.toArray() as [number, number, number],
        target: controls.target.toArray() as [number, number, number],
        zoom: camera.zoom,
      });
    });

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: buildFragmentShader(expression),
      uniforms: {
        uCameraPos: { value: camera.position },
        uCameraTarget: { value: controls.target },
        uResolution: { value: new THREE.Vector2(width, height) },
        uTime: { value: 0 },
        uMaterialColor: { value: new THREE.Vector3(...materialColor) },
      },
      depthTest: false,
      depthWrite: false,
    });

    // Check for compile error
    const gl = renderer.getContext();
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragShader, mat.fragmentShader);
    gl.compileShader(fragShader);
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(fragShader) ?? "Unknown GLSL error";
      setShaderError(log);
    } else {
      setShaderError(null);
    }
    gl.deleteShader(fragShader);

    materialRef.current = mat;
    scene.add(new THREE.Mesh(geo, mat));

    const clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      mat.uniforms.uCameraPos.value.copy(camera.position);
      mat.uniforms.uCameraTarget.value.copy(controls.target);
      mat.uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // Rebuild shader when expression changes
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    const newFrag = buildFragmentShader(expression);

    const renderer = rendererRef.current;
    if (renderer) {
      const gl = renderer.getContext();
      const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fragShader, newFrag);
      gl.compileShader(fragShader);
      if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        setShaderError(gl.getShaderInfoLog(fragShader) ?? "Unknown GLSL error");
        gl.deleteShader(fragShader);
        return; // keep last working shader
      }
      gl.deleteShader(fragShader);
      setShaderError(null);
    }

    mat.fragmentShader = newFrag;
    mat.needsUpdate = true;
  }, [expression]);

  // Update material color uniform
  useEffect(() => {
    const mat = materialRef.current;
    if (mat) mat.uniforms.uMaterialColor.value.set(...materialColor);
  }, [materialColor]);

  // Sync camera from external state
  useEffect(() => {
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera || !cameraState) return;
    isExternalUpdateRef.current = true;
    camera.position.set(...cameraState.position);
    controls.target.set(...cameraState.target);
    camera.zoom = cameraState.zoom;
    camera.updateProjectionMatrix();
    controls.update();
    isExternalUpdateRef.current = false;
  }, [cameraState]);

  return (
    <div style={{ position: "relative", width, height }}>
      <div ref={mountRef} style={{ width, height }} />
      {shaderError && (
        <div style={errorOverlayStyle}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>GLSL Error</div>
          <pre style={{ fontSize: 10, whiteSpace: "pre-wrap", margin: 0 }}>{shaderError}</pre>
        </div>
      )}
    </div>
  );
}

const errorOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(239,68,68,0.85)",
  color: "#fff",
  padding: 12,
  fontSize: 12,
  overflow: "auto",
  fontFamily: "ui-monospace, monospace",
};
