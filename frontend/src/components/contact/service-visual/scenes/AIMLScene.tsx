"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "../serviceConfig";
import { useIdleFrame, useCount } from "../sceneSettings";
import { GroundShadow, Halo, useDynamicLines } from "../parts";

// AI/ML — a glossy core inside a faint geodesic shell, surrounded by a
// loose network of nodes. Nodes breathe in place, their links pulse
// softly, and small signals travel along the links toward and away from
// the core. Everything is two instanced meshes + one line buffer, so the
// whole network is three draw calls regardless of node count.

const CORE_R = 0.48;

// Deterministic pseudo-random so the network is identical every mount.
function rand(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function buildNetwork(count: number) {
  const nodes: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const radius = 1.05 + rand(i) * 0.5;
    nodes.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius * 0.82, Math.sin(theta) * r * radius));
  }
  // Each node links to its two nearest neighbours; every third also links
  // to the core. Deduplicated so no edge is drawn twice.
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  nodes.forEach((a, i) => {
    const nearest = nodes
      .map((b, j) => ({ j, d: a.distanceToSquared(b) }))
      .filter((n) => n.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    for (const { j } of nearest) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    }
    if (i % 3 === 0) edges.push([i, -1]); // -1 = core
  });
  return { nodes, edges };
}

const tmp = new THREE.Object3D();
const a = new THREE.Vector3();
const b = new THREE.Vector3();

export default function AIMLScene() {
  const nodeCount = useCount(26, 14);
  const pulseCount = useCount(9, 4);
  const { nodes, edges } = useMemo(() => buildNetwork(nodeCount), [nodeCount]);

  const root = useRef<THREE.Group>(null!);
  const shell = useRef<THREE.LineSegments>(null!);
  const nodeMesh = useRef<THREE.InstancedMesh>(null!);
  const pulseMesh = useRef<THREE.InstancedMesh>(null!);
  const lineMat = useRef<THREE.LineBasicMaterial>(null!);
  const lineGeo = useDynamicLines(edges.length);
  const lines = useRef<THREE.LineSegments>(null!);
  // Current (drifting) node positions; rebuilt if the node count changes.
  const live = useRef<THREE.Vector3[]>([]);
  const shellGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.74, 1)), []);

  function endpoint(index: number, out: THREE.Vector3) {
    if (index === -1) return out.set(0, 0, 0);
    return out.copy(live.current[index]);
  }

  function update(t: number) {
    if (live.current.length !== nodes.length) live.current = nodes.map((n) => n.clone());
    // Nodes drift on small independent loops.
    nodes.forEach((n, i) => {
      const p = live.current[i];
      p.set(
        n.x + Math.sin(t * 0.7 + i * 1.3) * 0.05,
        n.y + Math.cos(t * 0.6 + i * 0.7) * 0.05,
        n.z + Math.sin(t * 0.5 + i * 2.1) * 0.05
      );
      tmp.position.copy(p);
      tmp.scale.setScalar(i % 5 === 0 ? 1.5 : 1);
      tmp.updateMatrix();
      nodeMesh.current.setMatrixAt(i, tmp.matrix);
    });
    nodeMesh.current.instanceMatrix.needsUpdate = true;

    const pos = lines.current.geometry.attributes.position as THREE.BufferAttribute;
    edges.forEach(([i, j], k) => {
      endpoint(i, a);
      endpoint(j, b);
      // Core links start at the core's surface, not its centre.
      if (j === -1) b.copy(a).setLength(CORE_R + 0.02);
      pos.setXYZ(k * 2, a.x, a.y, a.z);
      pos.setXYZ(k * 2 + 1, b.x, b.y, b.z);
    });
    pos.needsUpdate = true;

    // Signals: each walks one edge, then hops to another.
    for (let p = 0; p < pulseCount; p++) {
      const phase = t * 0.45 + p * 0.37;
      const edge = edges[(Math.floor(phase) * 7 + p * 5) % edges.length];
      const u = phase - Math.floor(phase);
      endpoint(edge[0], a);
      endpoint(edge[1], b);
      if (edge[1] === -1) b.copy(a).setLength(CORE_R + 0.02);
      tmp.position.lerpVectors(a, b, u);
      tmp.scale.setScalar(Math.sin(u * Math.PI));
      tmp.updateMatrix();
      pulseMesh.current.setMatrixAt(p, tmp.matrix);
    }
    pulseMesh.current.instanceMatrix.needsUpdate = true;
  }

  // Lay out a still frame immediately (and for reduced motion, the only one).
  useLayoutEffect(() => {
    update(1.2);
  });

  useIdleFrame((t) => {
    update(t + 1.2);
    root.current.rotation.y = t * 0.1;
    shell.current.rotation.y = -t * 0.18;
    shell.current.rotation.x = t * 0.07;
    root.current.position.y = Math.sin(t * 0.7) * 0.05;
    lineMat.current.userData.baseOpacity = 0.26 + Math.sin(t * 1.6) * 0.08;
  });

  return (
    <group>
      <Halo size={3.2} opacity={0.55} position={[0, 0, -1]} />
      <group ref={root} rotation={[0.25, 0, 0]} scale={0.9}>
        <mesh>
          <sphereGeometry args={[CORE_R, 48, 48]} />
          <meshPhysicalMaterial
            color={PALETTE.royal}
            emissive={PALETTE.navy}
            emissiveIntensity={0.35}
            roughness={0.18}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.08}
            transparent
          />
        </mesh>
        <lineSegments ref={shell} geometry={shellGeo}>
          <lineBasicMaterial color={PALETTE.electric} transparent opacity={0.32} depthWrite={false} />
        </lineSegments>

        <instancedMesh ref={nodeMesh} frustumCulled={false} args={[undefined, undefined, nodeCount]}>
          <sphereGeometry args={[0.045, 14, 14]} />
          <meshPhysicalMaterial color={PALETTE.white} roughness={0.25} clearcoat={1} transparent />
        </instancedMesh>

        <lineSegments ref={lines} geometry={lineGeo} frustumCulled={false}>
          <lineBasicMaterial ref={lineMat} color={PALETTE.electric} transparent opacity={0.28} depthWrite={false} />
        </lineSegments>

        <instancedMesh ref={pulseMesh} frustumCulled={false} args={[undefined, undefined, pulseCount]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color={PALETTE.electric} emissive={PALETTE.electric} emissiveIntensity={0.9} transparent />
        </instancedMesh>
      </group>
      <GroundShadow width={2.4} depth={0.7} y={-1.55} opacity={0.25} />
    </group>
  );
}
