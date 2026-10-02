"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { PALETTE } from "../serviceConfig";
import { useIdleFrame, useCount } from "../sceneSettings";
import { SurfaceMaterial, GroundShadow, Halo, useDynamicLines } from "../parts";

// OTHER (also the idle state before anything is picked) — a quiet
// geometric system: a navy rounded cube, a hairline orbit ring carrying
// three satellites tethered back to the cube, and a sparse field of
// particles drifting around it.

const RING_R = 1.28;
const RING_TILT = new THREE.Euler(1.15, 0.32, 0);
const SATELLITES = 3;

const tmp = new THREE.Object3D();
const v = new THREE.Vector3();

function rand(i: number) {
  const x = Math.sin(i * 91.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
}

export default function OtherScene() {
  const particleCount = useCount(22, 10);
  const cube = useRef<THREE.Mesh>(null!);
  const ring = useRef<THREE.Group>(null!);
  const sats = useRef<(THREE.Object3D | null)[]>([]);
  const dust = useRef<THREE.InstancedMesh>(null!);
  const field = useRef<THREE.Group>(null!);
  const root = useRef<THREE.Group>(null!);
  const tetherGeo = useDynamicLines(SATELLITES);
  const tethers = useRef<THREE.LineSegments>(null!);

  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => {
        const theta = rand(i) * Math.PI * 2;
        const phi = Math.acos(2 * rand(i + 50) - 1);
        const r = 1.55 + rand(i + 100) * 0.5;
        return new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi) * 0.7,
          r * Math.sin(phi) * Math.sin(theta)
        );
      }),
    [particleCount]
  );

  function update(t: number) {
    const pos = tethers.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < SATELLITES; i++) {
      const a = t * 0.35 + (i * Math.PI * 2) / SATELLITES;
      v.set(Math.cos(a) * RING_R, Math.sin(a) * RING_R, 0).applyEuler(RING_TILT);
      sats.current[i]?.position.copy(v);
      pos.setXYZ(i * 2, 0, 0, 0);
      pos.setXYZ(i * 2 + 1, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;

    particles.forEach((p, i) => {
      tmp.position.copy(p);
      tmp.position.y += Math.sin(t * 0.6 + i) * 0.06;
      tmp.scale.setScalar(0.6 + rand(i + 200) * 0.8);
      tmp.updateMatrix();
      dust.current.setMatrixAt(i, tmp.matrix);
    });
    dust.current.instanceMatrix.needsUpdate = true;
  }

  useLayoutEffect(() => {
    update(0.8);
  });

  useIdleFrame((t) => {
    update(t + 0.8);
    cube.current.rotation.x = 0.45 + t * 0.12;
    cube.current.rotation.y = 0.6 + t * 0.17;
    ring.current.rotation.z = t * 0.05;
    field.current.rotation.y = t * 0.04;
    root.current.position.y = Math.sin(t * 0.7) * 0.07;
  });

  return (
    <group>
      <Halo size={3} opacity={0.45} position={[0, 0, -1]} />
      <group ref={root}>
        <RoundedBox ref={cube} args={[1, 1, 1]} radius={0.18} smoothness={4} rotation={[0.45, 0.6, 0]}>
          <SurfaceMaterial finish="dark" color={PALETTE.navy} />
        </RoundedBox>

        <group ref={ring}>
          <mesh rotation={RING_TILT}>
            <torusGeometry args={[RING_R, 0.01, 8, 128]} />
            <SurfaceMaterial finish="glow" opacity={0.75} />
          </mesh>
          <lineSegments ref={tethers} geometry={tetherGeo} frustumCulled={false}>
            <lineBasicMaterial color={PALETTE.electric} transparent opacity={0.25} depthWrite={false} />
          </lineSegments>

          <mesh ref={(el) => { sats.current[0] = el; }}>
            <sphereGeometry args={[0.16, 32, 32]} />
            <SurfaceMaterial finish="glass" />
          </mesh>
          <RoundedBox ref={(el) => { sats.current[1] = el; }} args={[0.26, 0.26, 0.26]} radius={0.05} smoothness={3}>
            <SurfaceMaterial finish="accent" />
          </RoundedBox>
          <mesh ref={(el) => { sats.current[2] = el; }}>
            <icosahedronGeometry args={[0.13, 0]} />
            <SurfaceMaterial finish="glow" color={PALETTE.electric} />
          </mesh>
        </group>

        <group ref={field}>
          <instancedMesh ref={dust} frustumCulled={false} args={[undefined, undefined, particleCount]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial color={PALETTE.royal} transparent opacity={0.45} />
          </instancedMesh>
        </group>
      </group>
      <GroundShadow width={2.2} depth={0.7} y={-1.45} opacity={0.32} />
    </group>
  );
}
