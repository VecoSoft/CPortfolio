"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { PALETTE } from "../serviceConfig";
import { useIdleFrame, useCount } from "../sceneSettings";
import { SurfaceMaterial, GroundShadow, useDynamicLines, pulseWindow, smooth } from "../parts";

// SOFTWARE — a three-tier system seen from above: service modules on top,
// an API gateway in the middle, data stores below. One service and one
// store take turns detaching (their link retracts into the gateway) and
// snapping back, while small packets flow along the live links.

const TOP_Y = 0.75;
const BOTTOM_Y = -0.78;
const XS = [-0.85, 0, 0.85];

// Edge k: 0–2 service→gateway, 3–5 gateway→store.
const EDGE_COUNT = 6;

const tmp = new THREE.Object3D();

export default function SoftwareScene() {
  const perEdge = useCount(2, 1);
  const root = useRef<THREE.Group>(null!);
  const detachTop = useRef<THREE.Group>(null!);
  const detachBottom = useRef<THREE.Group>(null!);
  const packets = useRef<THREE.InstancedMesh>(null!);
  const lineGeo = useDynamicLines(EDGE_COUNT);
  const lines = useRef<THREE.LineSegments>(null!);

  function update(t: number, animate: boolean) {
    // 0 = docked, 1 = fully detached.
    const dTop = animate ? smooth(pulseWindow(t, 8, 0, 0.32)) : 0;
    const dBottom = animate ? smooth(pulseWindow(t, 8, -4, 0.32)) : 0;

    detachTop.current.position.set(XS[2] + dTop * 0.14, TOP_Y + dTop * 0.34, 0);
    detachBottom.current.position.set(XS[0] - dBottom * 0.4, BOTTOM_Y - dBottom * 0.05, 0);

    const pos = lines.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < EDGE_COUNT; k++) {
      const x = XS[k % 3];
      const top = k < 3;
      // Retract the detached modules' links back toward the gateway.
      const d = top && k === 2 ? dTop : !top && k === 3 ? dBottom : 0;
      const from = top ? 0.08 : -0.08;
      const fullTo = top ? TOP_Y - 0.09 : BOTTOM_Y + 0.18;
      const to = from + (fullTo - from) * (1 - d);
      pos.setXYZ(k * 2, x, from, 0);
      pos.setXYZ(k * 2 + 1, x, to, 0);

      for (let p = 0; p < perEdge; p++) {
        const u = (t * 0.5 + p / perEdge + k * 0.17) % 1;
        // Requests travel down, responses travel up on alternate links.
        const along = k % 2 === 0 ? u : 1 - u;
        tmp.position.set(x, fullTo + (from - fullTo) * along, 0);
        tmp.scale.setScalar(Math.sin(u * Math.PI) * (1 - Math.min(d * 4, 1)));
        tmp.updateMatrix();
        packets.current.setMatrixAt(k * perEdge + p, tmp.matrix);
      }
    }
    pos.needsUpdate = true;
    packets.current.instanceMatrix.needsUpdate = true;
  }

  useLayoutEffect(() => {
    update(0.6, false);
  });

  useIdleFrame((t) => {
    update(t + 0.6, true);
    root.current.rotation.y = -0.62 + Math.sin(t * 0.28) * 0.16;
    root.current.position.y = -0.05 + Math.sin(t * 0.7) * 0.05;
  });

  return (
    <group>
      <group ref={root} rotation={[0.5, -0.62, 0]} position={[0, -0.05, 0]} scale={0.95}>
        {/* Services */}
        {XS.slice(0, 2).map((x, i) => (
          <group key={x} position={[x, TOP_Y, 0]}>
            <RoundedBox args={[0.62, 0.18, 0.62]} radius={0.06} smoothness={3}>
              <SurfaceMaterial finish={i === 1 ? "accent" : "glass"} />
            </RoundedBox>
            <RoundedBox args={[0.26, 0.03, 0.26]} radius={0.012} smoothness={2} position={[0, 0.1, 0]}>
              <SurfaceMaterial finish={i === 1 ? "matte" : "accent"} color={i === 1 ? PALETTE.white : undefined} />
            </RoundedBox>
          </group>
        ))}
        <group ref={detachTop} position={[XS[2], TOP_Y, 0]}>
          <RoundedBox args={[0.62, 0.18, 0.62]} radius={0.06} smoothness={3}>
            <SurfaceMaterial finish="glass" />
          </RoundedBox>
          <RoundedBox args={[0.26, 0.03, 0.26]} radius={0.012} smoothness={2} position={[0, 0.1, 0]}>
            <SurfaceMaterial finish="glow" />
          </RoundedBox>
        </group>

        {/* API gateway */}
        <RoundedBox args={[2.36, 0.16, 0.56]} radius={0.06} smoothness={3}>
          <SurfaceMaterial finish="dark" />
        </RoundedBox>
        {[-0.9, -0.54, -0.18, 0.18, 0.54, 0.9].map((x, i) => (
          <mesh key={x} position={[x, 0.085, 0.16]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.028, 16]} />
            <SurfaceMaterial finish="glow" color={i % 3 === 0 ? PALETTE.cyan : PALETTE.electric} />
          </mesh>
        ))}

        {/* Data stores */}
        <group ref={detachBottom} position={[XS[0], BOTTOM_Y, 0]}>
          <Store />
        </group>
        <group position={[XS[1], BOTTOM_Y, 0]}>
          <RoundedBox args={[0.42, 0.3, 0.42]} radius={0.06} smoothness={3}>
            <SurfaceMaterial finish="accent" color={PALETTE.navy} />
          </RoundedBox>
        </group>
        <group position={[XS[2], BOTTOM_Y, 0]}>
          <Store />
        </group>

        <lineSegments ref={lines} geometry={lineGeo} frustumCulled={false}>
          <lineBasicMaterial color={PALETTE.electric} transparent opacity={0.5} depthWrite={false} />
        </lineSegments>
        <instancedMesh ref={packets} frustumCulled={false} args={[undefined, undefined, EDGE_COUNT * perEdge]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color={PALETTE.electric} emissive={PALETTE.electric} emissiveIntensity={0.9} transparent />
        </instancedMesh>
      </group>
      <GroundShadow width={3} depth={1} y={-1.45} opacity={0.32} />
    </group>
  );
}

// Database cylinder with two accent bands.
function Store() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.24, 0.24, 0.34, 40]} />
        <SurfaceMaterial finish="glass" />
      </mesh>
      {[-0.06, 0.06].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.245, 0.245, 0.018, 40]} />
          <SurfaceMaterial finish="accent" />
        </mesh>
      ))}
    </group>
  );
}
