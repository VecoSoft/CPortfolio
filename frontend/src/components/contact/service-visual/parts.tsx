"use client";

import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import { PALETTE } from "./serviceConfig";

// Small, reusable building blocks shared by every service scene. All
// geometry is procedural (no model files, no textures beyond one tiny
// generated shadow gradient) and cached by its dimensions so repeated UI
// "cards" across scenes share a single BufferGeometry.

const geometryCache = new Map<string, THREE.BufferGeometry>();

// Card/slab with rounded corners in the XY plane and a small bevel on the
// edges — unlike a rounded box, the corner radius doesn't depend on depth,
// so a 0.03-thick UI card can still have soft 0.08 corners.
export function roundedSlab(w: number, h: number, depth: number, r: number) {
  const key = `slab:${w}:${h}:${depth}:${r}`;
  const cached = geometryCache.get(key);
  if (cached) return cached;

  const radius = Math.min(r, w / 2, h / 2);
  const bevel = Math.min(depth * 0.35, 0.012);
  const x = -w / 2 + bevel;
  const y = -h / 2 + bevel;
  const iw = w - bevel * 2;
  const ih = h - bevel * 2;
  const ir = Math.max(radius - bevel, 0.001);

  const shape = new THREE.Shape();
  shape.moveTo(x + ir, y);
  shape.lineTo(x + iw - ir, y);
  shape.quadraticCurveTo(x + iw, y, x + iw, y + ir);
  shape.lineTo(x + iw, y + ih - ir);
  shape.quadraticCurveTo(x + iw, y + ih, x + iw - ir, y + ih);
  shape.lineTo(x + ir, y + ih);
  shape.quadraticCurveTo(x, y + ih, x, y + ih - ir);
  shape.lineTo(x, y + ir);
  shape.quadraticCurveTo(x, y, x + ir, y);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(depth - bevel * 2, 0.001),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 5,
  });
  geo.center();
  geometryCache.set(key, geo);
  return geo;
}

type MeshProps = Omit<ThreeElements["mesh"], "args">;

export type Finish = "glass" | "matte" | "accent" | "glow" | "dark";

// One place that decides what "premium" means for a surface, so all six
// scenes share the same lighting response.
export function SurfaceMaterial({
  finish = "matte",
  color,
  opacity = 1,
}: {
  finish?: Finish;
  color?: string;
  opacity?: number;
}) {
  switch (finish) {
    case "glass":
      return (
        <meshPhysicalMaterial
          color={color ?? PALETTE.white}
          // A little self-light keeps white panels reading as white, not
          // grey, on the side facing away from the key light.
          emissive={color ?? PALETTE.white}
          emissiveIntensity={0.18}
          roughness={0.28}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.18}
          transparent
          opacity={opacity * 0.94}
        />
      );
    case "dark":
      return (
        <meshPhysicalMaterial
          color={color ?? PALETTE.deepNavy}
          roughness={0.32}
          metalness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.12}
          transparent
          opacity={opacity}
        />
      );
    case "accent":
      return (
        <meshPhysicalMaterial
          color={color ?? PALETTE.royal}
          roughness={0.35}
          metalness={0.05}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
          transparent
          opacity={opacity}
        />
      );
    case "glow":
      return (
        <meshStandardMaterial
          color={color ?? PALETTE.electric}
          emissive={color ?? PALETTE.electric}
          emissiveIntensity={0.55}
          roughness={0.4}
          transparent
          opacity={opacity}
        />
      );
    default:
      return (
        <meshStandardMaterial
          color={color ?? PALETTE.ice}
          roughness={0.6}
          metalness={0}
          transparent
          opacity={opacity}
        />
      );
  }
}

export const Slab = forwardRef<
  THREE.Mesh,
  MeshProps & {
    size: [number, number, number];
    radius?: number;
    finish?: Finish;
    color?: string;
    opacity?: number;
  }
>(function Slab({ size, radius = 0.06, finish, color, opacity, ...props }, ref) {
  const geo = roundedSlab(size[0], size[1], size[2], radius);
  return (
    <mesh ref={ref} geometry={geo} {...props}>
      <SurfaceMaterial finish={finish} color={color} opacity={opacity} />
    </mesh>
  );
});

// A "line of text" placeholder — the universal UI shorthand.
export function TextLine({
  width,
  position,
  color = PALETTE.mist,
  height = 0.045,
}: {
  width: number;
  position: [number, number, number];
  color?: string;
  height?: number;
}) {
  return <Slab size={[width, height, 0.012]} radius={height / 2} color={color} position={position} />;
}

export function Dot({
  radius = 0.03,
  color = PALETTE.mist,
  finish = "matte",
  ...props
}: MeshProps & { radius?: number; color?: string; finish?: Finish }) {
  return (
    <mesh {...props}>
      <circleGeometry args={[radius, 20]} />
      <SurfaceMaterial finish={finish} color={color} />
    </mesh>
  );
}

// Plain 1px line segments between pairs of points. Cheap: one draw call.
export const Segments = forwardRef<
  THREE.LineSegments,
  { points: [number, number, number][]; color?: string; opacity?: number }
>(function Segments({ points, color = PALETTE.electric, opacity = 0.45 }, ref) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));
    return g;
  }, [points]);
  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
});

let cursorGeo: THREE.ExtrudeGeometry | null = null;
function getCursorGeometry() {
  if (cursorGeo) return cursorGeo;
  const s = new THREE.Shape();
  // Classic pointer arrow, tip at the origin.
  s.moveTo(0, 0);
  s.lineTo(0, -0.26);
  s.lineTo(0.065, -0.2);
  s.lineTo(0.11, -0.3);
  s.lineTo(0.15, -0.28);
  s.lineTo(0.105, -0.185);
  s.lineTo(0.19, -0.185);
  s.lineTo(0, 0);
  cursorGeo = new THREE.ExtrudeGeometry(s, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 1,
  });
  return cursorGeo;
}

export const Cursor = forwardRef<THREE.Group, ThreeElements["group"]>(function Cursor(props, ref) {
  return (
    <group ref={ref} {...props}>
      <mesh geometry={getCursorGeometry()}>
        <SurfaceMaterial finish="dark" />
      </mesh>
    </group>
  );
});

let shadowTexture: THREE.CanvasTexture | null = null;
function getShadowTexture() {
  if (shadowTexture) return shadowTexture;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(11,23,54,0.55)");
  g.addColorStop(0.45, "rgba(11,23,54,0.2)");
  g.addColorStop(1, "rgba(11,23,54,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  shadowTexture = new THREE.CanvasTexture(canvas);
  return shadowTexture;
}

// Soft contact shadow under the floating object — a single textured quad
// instead of a real shadow map, which would cost a whole extra render.
export function GroundShadow({
  width = 2.6,
  depth = 0.9,
  y = -1.35,
  opacity = 0.5,
}: {
  width?: number;
  depth?: number;
  y?: number;
  opacity?: number;
}) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, y, 0]}>
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial map={getShadowTexture()} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

const glowTextures = new Map<string, THREE.CanvasTexture>();
function getGlowTexture(rgb: string) {
  const cached = glowTextures.get(rgb);
  if (cached) return cached;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${rgb},0.5)`);
  g.addColorStop(0.5, `rgba(${rgb},0.14)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  glowTextures.set(rgb, tex);
  return tex;
}

// Soft light bloom behind an object (screen glow, orb aura) — a billboard
// quad, far cheaper than a post-processing bloom pass.
export function Halo({
  size = 3,
  rgb = "59,130,246",
  opacity = 0.6,
  ...props
}: Omit<ThreeElements["mesh"], "args"> & { size?: number; rgb?: string; opacity?: number }) {
  return (
    <mesh {...props}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={getGlowTexture(rgb)} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

// Fades every material under `obj` to `v` × its authored opacity. Writes
// `userData.baseOpacity`, which SceneSlot multiplies by the scene's own
// enter/exit fade — so idle fades and transitions compose instead of
// fighting over `material.opacity`.
export function fadeGroup(obj: THREE.Object3D, v: number) {
  obj.traverse((o) => {
    const m = (o as THREE.Mesh).material;
    if (!m) return;
    for (const mat of Array.isArray(m) ? m : [m]) {
      if (mat.userData.authored === undefined) {
        mat.userData.authored = mat.userData.baseOpacity ?? mat.opacity;
      }
      mat.userData.baseOpacity = mat.userData.authored * v;
    }
  });
}

// Mutable line geometry for connections whose endpoints move every frame.
export function useDynamicLines(segmentCount: number) {
  return useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(segmentCount * 6), 3));
    return g;
  }, [segmentCount]);
}

// Damped approach toward a target — frame-rate independent.
export function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(current, target, lambda, dt);
}

// 0→1→0 window used for things that pop in, hold, then leave on a loop.
export function pulseWindow(t: number, period: number, offset: number, hold = 0.55) {
  const p = (((t + offset) % period) + period) % period / period;
  const fade = 0.12;
  if (p < fade) return smooth(p / fade);
  if (p < hold) return 1;
  if (p < hold + fade) return 1 - smooth((p - hold) / fade);
  return 0;
}

export function smooth(x: number) {
  const c = Math.min(Math.max(x, 0), 1);
  return c * c * (3 - 2 * c);
}
