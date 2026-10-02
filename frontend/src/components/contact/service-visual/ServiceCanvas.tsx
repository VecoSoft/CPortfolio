"use client";

import { useLayoutEffect, useRef, useState, type ComponentType, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import type { ServiceId } from "./serviceConfig";
import { SceneSettingsContext, useSceneSettings } from "./sceneSettings";
import WebScene from "./scenes/WebScene";
import MobileScene from "./scenes/MobileScene";
import AIMLScene from "./scenes/AIMLScene";
import SoftwareScene from "./scenes/SoftwareScene";
import UIUXScene from "./scenes/UIUXScene";
import OtherScene from "./scenes/OtherScene";

// This module is the only one that imports three.js; ServiceVisual loads
// it with next/dynamic (ssr: false), so the WebGL bundle is fetched only
// on the quote page and only once the visual is near the viewport.

const SCENES: Record<ServiceId, ComponentType> = {
  Web: WebScene,
  Mobile: MobileScene,
  "AI/ML": AIMLScene,
  Software: SoftwareScene,
  "UI/UX": UIUXScene,
  Other: OtherScene,
};

const TRANSITION_S = 0.75;
const REDUCED_TRANSITION_S = 0.3;
const CAMERA_Z = 6.4;

export type PointerRef = RefObject<{ x: number; y: number }>;

export default function ServiceCanvas({
  service,
  running,
  reducedMotion,
  lowPower,
  pointer,
  onReady,
}: {
  service: ServiceId;
  running: boolean;
  reducedMotion: boolean;
  lowPower: boolean;
  pointer: PointerRef;
  onReady: () => void;
}) {
  return (
    <Canvas
      // Continuous rendering only while on screen and motion is allowed;
      // otherwise frames are drawn on demand (transitions invalidate
      // themselves until they settle, then the GPU goes idle).
      frameloop={running && !reducedMotion ? "always" : "demand"}
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0.15, CAMERA_Z], fov: 32, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      flat
      // Purely visual: never intercept clicks/scroll meant for the form.
      style={{ pointerEvents: "none" }}
      onCreated={onReady}
    >
      <SceneSettingsContext value={{ reducedMotion, lowPower }}>
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#ffffff", "#c9d8f0", 0.7]} />
        <directionalLight position={[3, 5, 6]} intensity={1.5} />
        <directionalLight position={[-5, 1, -3]} intensity={0.7} color="#9ec5ff" />

        {/* Reflections from a tiny, once-rendered studio environment —
            soft light strips instead of a downloaded HDR. */}
        <Environment resolution={64} frames={1}>
          <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#bcd4ff" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[4, 3, 1]} />
          <Lightformer form="rect" intensity={0.8} color="#dbe8ff" position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[4, 3, 1]} />
        </Environment>

        <CameraRig service={service} pointer={pointer} />
        <SceneSwitcher service={service} />
      </SceneSettingsContext>
    </Canvas>
  );
}

// Subtle mouse parallax plus a small dolly "breath" on every selection
// change, so the swap feels like a camera move, not a hard cut.
function CameraRig({ service, pointer }: { service: ServiceId; pointer: PointerRef }) {
  const { reducedMotion } = useSceneSettings();
  const invalidate = useThree((s) => s.invalidate);
  const kick = useRef(0);
  const last = useRef(service);

  useFrame(({ camera }, rawDt) => {
    // Real elapsed time (capped only for tab-switch jumps) so a transition
    // lasts its intended duration even on a slow, low-fps device.
    const dt = Math.min(rawDt, 0.25);
    if (last.current !== service) {
      last.current = service;
      if (!reducedMotion) kick.current = 1;
    }
    kick.current = Math.max(0, kick.current - dt / 0.8);
    const breath = Math.sin(kick.current * Math.PI);

    const px = reducedMotion ? 0 : pointer.current.x;
    const py = reducedMotion ? 0 : pointer.current.y;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px * 0.4, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.15 + py * 0.25, 2.5, dt);
    camera.position.z = CAMERA_Z + breath * 0.45;
    camera.lookAt(0, 0, 0);

    if (kick.current > 0) invalidate();
  });
  return null;
}

type Entry = { key: number; service: ServiceId };

// Keeps the outgoing scene mounted while the incoming one fades in, so a
// selection change crossfades (scale + lift + rotation + opacity) rather
// than swapping instantly.
function SceneSwitcher({ service }: { service: ServiceId }) {
  const [entries, setEntries] = useState<Entry[]>([{ key: 0, service }]);
  const [shown, setShown] = useState(service);

  // Adjust state during render when the prop changes (React's recommended
  // alternative to a setState-in-effect).
  if (service !== shown) {
    setShown(service);
    setEntries((prev) => {
      const next = [...prev, { key: prev[prev.length - 1].key + 1, service }];
      // Rapid clicking: never keep more than one outgoing scene alive.
      return next.slice(-2);
    });
  }

  return (
    <>
      {entries.map((entry, i) => {
        const Scene = SCENES[entry.service];
        return (
          <SceneSlot
            key={entry.key}
            leaving={i !== entries.length - 1}
            onExited={() => setEntries((prev) => prev.filter((e) => e.key !== entry.key))}
          >
            <Scene />
          </SceneSlot>
        );
      })}
    </>
  );
}

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Kept outside the component so the compiler treats it as a plain helper
// mutating three.js objects, not React state.
function applyOpacity(materials: THREE.Material[], e: number) {
  for (const mat of materials) mat.opacity = (mat.userData.baseOpacity ?? 1) * e;
}

function SceneSlot({ leaving, onExited, children }: { leaving: boolean; onExited: () => void; children: ReactNode }) {
  const { reducedMotion } = useSceneSettings();
  const invalidate = useThree((s) => s.invalidate);
  const group = useRef<THREE.Group>(null!);
  const materials = useRef<THREE.Material[]>([]);
  const progress = useRef(0);
  const exited = useRef(false);

  // Collect every material once the scene has mounted. Each records its
  // authored opacity as `baseOpacity`; scenes may change that value for
  // their own idle fades, and this slot multiplies it by the transition.
  useLayoutEffect(() => {
    const found = new Set<THREE.Material>();
    group.current.traverse((o) => {
      const m = (o as THREE.Mesh).material;
      if (!m) return;
      for (const mat of Array.isArray(m) ? m : [m]) found.add(mat);
    });
    found.forEach((mat) => {
      mat.transparent = true;
      if (mat.userData.baseOpacity === undefined) mat.userData.baseOpacity = mat.opacity;
      mat.opacity = 0;
    });
    materials.current = [...found];
    group.current.visible = false;
    invalidate();
  }, [invalidate]);

  useFrame((_, rawDt) => {
    // Real elapsed time (capped only for tab-switch jumps) so a transition
    // lasts its intended duration even on a slow, low-fps device.
    const dt = Math.min(rawDt, 0.25);
    const duration = reducedMotion ? REDUCED_TRANSITION_S : TRANSITION_S;
    const target = leaving ? 0 : 1;
    const p = progress.current;
    progress.current = leaving ? Math.max(0, p - dt / duration) : Math.min(1, p + dt / duration);
    const e = easeInOutCubic(progress.current);

    const g = group.current;
    if (reducedMotion) {
      g.scale.setScalar(1);
      g.position.set(0, 0, 0);
      g.rotation.set(0, 0, 0);
    } else if (leaving) {
      // Lift away and shrink slightly.
      g.scale.setScalar(0.9 + 0.1 * e);
      g.position.set(0, (1 - e) * 0.3, -(1 - e) * 0.4);
      g.rotation.set(0, (1 - e) * 0.35, 0);
    } else {
      // Rise in from just below, turning into place.
      g.scale.setScalar(0.86 + 0.14 * e);
      g.position.set(0, -(1 - e) * 0.32, 0);
      g.rotation.set(0, -(1 - e) * 0.45, 0);
    }
    g.visible = e > 0.002;
    applyOpacity(materials.current, e);

    if (progress.current !== target) {
      invalidate();
    } else if (leaving && !exited.current) {
      exited.current = true;
      onExited();
    }
  });

  return <group ref={group}>{children}</group>;
}
